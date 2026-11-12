# Architecture technique — Watcher

_Rédigé le 12/11/2026, à partir du code de `main` (commit `fdb0a7f`)._

Watcher regroupe les abonnements YouTube et Twitch d'un utilisateur dans un seul fil de vidéos, avec un lecteur intégré, la reprise de lecture, les favoris et le masquage de chaînes ou de vidéos.

Ce document décrit comment le code est organisé et comment l'application fonctionne. Les études plus ciblées sont dans `docs/internal/` (non versionné) : `PERFORMANCE.md`, `YOUTUBE.md`, `TWITCH.md`.

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Organisation du monorepo](#2-organisation-du-monorepo)
3. [L'application `apps/client`](#3-lapplication-appsclient)
4. [Le mini-framework interne (`modules/framework`)](#4-le-mini-framework-interne-modulesframework)
5. [Cycle d'une requête API](#5-cycle-dune-requête-api)
6. [Authentification et sessions](#6-authentification-et-sessions)
7. [Base de données](#7-base-de-données)
8. [Intégrations YouTube et Twitch](#8-intégrations-youtube-et-twitch)
9. [Synchronisation](#9-synchronisation)
10. [Images](#10-images)
11. [Lecture des vidéos](#11-lecture-des-vidéos)
12. [Front-end](#12-front-end)
13. [Sécurité](#13-sécurité)
14. [Logs, tâches et stockage Nitro](#14-logs-tâches-et-stockage-nitro)
15. [Configuration et outillage](#15-configuration-et-outillage)
16. [Conventions de code](#16-conventions-de-code)

---

## 1. Vue d'ensemble

| Couche           | Technologie                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| Application      | Nuxt 4 (mode compatibilité 5), SSR, Vue 3, Tailwind 4, reka-ui            |
| Serveur          | Nitro (inclus dans Nuxt), handlers H3                                     |
| Base de données  | PostgreSQL, requêtes avec Kysely, migrations avec kysely-ctl              |
| Authentification | nuxt-auth-utils (cookie de session scellé, OAuth Google/Twitch, WebAuthn) |
| Images           | sharp (redimensionnement et conversion AVIF), stockage disque ou S3       |
| Lecteur          | Video.js 10 (`@videojs/html`) : embed YouTube, HLS pour Twitch            |
| Validation       | Zod (`zod/mini`), partagé entre front et serveur                          |
| Logs             | pino (pino-pretty en local, pino-roll en fichiers ailleurs)               |
| Outillage        | pnpm workspaces, oxlint, oxfmt, husky                                     |

Il n'y a **qu'un seul processus** : le serveur Nuxt sert les pages (SSR), l'API (`/api/**`), et exécute les tâches planifiées. Il n'y a pas de worker séparé ni de file de messages ; la synchronisation des abonnements tourne dans la requête HTTP qui la déclenche.

```
             ┌───────────────────────── apps/client (Nuxt) ─────────────────────────┐
Navigateur ──┤  app/  (pages Vue, SSR + hydratation)                                │
             │     │ useAppFetch / callApi                                          │
             │     ▼                                                                │
             │  server/api/**  ──►  services (server/lib/services)  ──►  @watcher/database ──► PostgreSQL
             │                         │                                            │
             │                         ├──► @watcher/integration-google ──► API YouTube
             │                         ├──► @watcher/integration-twitch ──► API Helix / GQL Twitch
             │                         └──► images (sharp) ──► disque ou S3         │
             └──────────────────────────────────────────────────────────────────────┘
```

## 2. Organisation du monorepo

Workspace pnpm (`pnpm-workspace.yaml`), avec un **catalogue** de versions partagées (`catalog:` dans les `package.json`).

```
.
├── apps/
│   ├── client/          L'application (front + API), package `watcher`
│   └── landing_page/    Site vitrine statique (Nuxt + @nuxtjs/seo), indépendant de l'API
├── packages/
│   ├── common/          @watcher/common : types, ressources API, erreurs, options HTTP
│   ├── database/        @watcher/database : Kysely, migrations, repositories
│   ├── google/          @watcher/integration-google : client YouTube Data API
│   ├── twitch/          @watcher/integration-twitch : client Helix + GQL Twitch
│   ├── i18n/            @watcher/i18n : module Nuxt (locales en/fr/es, formatage)
│   └── ui/              @watcher/ui : module Nuxt (composants Watcher*, Tailwind, thèmes)
├── docs/
├── oxlint.config.ts, oxfmt.config.ts
└── .husky/pre-commit    lint + format avant chaque commit
```

Les packages sont consommés **en TypeScript source** (`exports` pointant sur `src/*.ts`) : pas d'étape de build, c'est Nuxt/Vite qui compile.

### Dépendances entre packages

```
apps/client ─┬─► common
             ├─► database ─► common
             ├─► integration-google ─► common (types)
             ├─► integration-twitch ─► common (types)
             ├─► ui ─► i18n
             └─► i18n
apps/landing_page ─► ui, i18n
```

Règles qui en découlent :

- **`common`** ne dépend de rien d'interne. C'est là que vivent les types partagés entre front et serveur (`VideoListResource`, `SubscriptionResource`, `UserResource`…), les erreurs métier (`HttpError` et sous-classes) et `request_options()` pour les appels sortants.
- **`database`**, **`google`** et **`twitch`** ne connaissent pas Nuxt : ils peuvent tourner hors de Nitro (migrations, scripts). La base lit directement `process.env.NUXT_DATABASE_*`, et les clients d'API reçoivent leurs tokens par callbacks (`onRequest`, `onRefreshToken`).
- **`ui`** et **`i18n`** sont des **modules Nuxt** : ils s'ajoutent dans `modules` du `nuxt.config.ts` et enregistrent composants, composables, CSS et locales.

## 3. L'application `apps/client`

```
apps/client/
├── nuxt.config.ts
├── app/                    Front (srcDir Nuxt 4)
│   ├── pages/              Routes : /, /videos, /videos/[id], /subscriptions/[...slug],
│   │                       /settings, /onboarding, /auth/login
│   ├── layouts/            default (sidebar + topbar), auth
│   ├── middleware/         auth.global.ts : redirections login / onboarding
│   ├── components/         Rangés par domaine : videos/, subscriptions/, dashboard/,
│   │                       settings/, onboarding/, auth/, shared/
│   ├── composables/        Accès API et logique d'UI (useVideos, useSubscriptions…)
│   └── utils/
├── server/                 Back (Nitro)
│   ├── api/                Routes HTTP, une par fichier (convention Nitro)
│   ├── routes/             Routes hors /api (uploads/ pour le driver disque)
│   ├── middleware/         session.ts : charge l'utilisateur depuis la base
│   ├── plugins/            logger, security (headers + CSP), session (hooks auth)
│   ├── lib/
│   │   ├── services/       Logique métier, une classe par fichier (voir §4)
│   │   ├── google.ts       Client Google + cache des tokens
│   │   ├── twitch.ts       Client Twitch + cache des tokens
│   │   ├── images_storage.ts  Driver disque / S3
│   │   └── rate_limiter.ts
│   ├── utils/              Helpers transverses (session, oauth, images, proxy, chiffrement…)
│   └── tasks/              Tâches Nitro (purge, migrations d'images, palettes)
├── shared/                 Code importé par le front ET le serveur
│   ├── validators/         Schémas Zod des routes (defineValidator)
│   ├── types/              auth.d.ts (types de session), sync.ts
│   └── utils/
├── modules/framework/      Module Nuxt local (voir §4)
└── i18n/locales/           Traductions propres à l'app (fusionnées avec @watcher/i18n)
```

Les alias à connaître :

| Alias               | Cible                                                           |
| ------------------- | --------------------------------------------------------------- |
| `#shared/…`         | `apps/client/shared/…`                                          |
| `#server/…`         | `apps/client/server/…`                                          |
| `#framework`        | `defineRoute`, `withHttpErrors`, `useLogger`, `AbstractService` |
| `#framework/server` | l'objet `services` (généré)                                     |
| `#framework/client` | `defineValidator`, `InferValidators` (utilisable côté front)    |
| `#framework/auth`   | les helpers serveur de nuxt-auth-utils, ré-exportés             |

## 4. Le mini-framework interne (`modules/framework`)

C'est un module Nuxt local (chargé automatiquement car il est dans `modules/`). Au démarrage, il régénère le dossier `apps/client/.framework/` et y écrit quatre fichiers, exposés par les alias ci-dessus.

### 4.1 Registre de services (`#framework/server`)

`services/builder.ts` parcourt `server/lib/services/**/*.ts` et génère un objet `services` dont la forme suit l'arborescence :

| Fichier                                          | Accès                              |
| ------------------------------------------------ | ---------------------------------- |
| `server/lib/services/videos.ts`                  | `services.videos`                  |
| `server/lib/services/sync/youtube.ts`            | `services.sync.youtube`            |
| `server/lib/services/external/twitch/helpers.ts` | `services.external.twitch.helpers` |

Chaque fichier exporte **par défaut** une classe qui étend `AbstractService` ; le registre en crée **une seule instance** (singleton par processus). Les services s'appellent entre eux via ce même objet (`services.sessions.forget_user(...)`), sans injection de dépendances.

> Ajouter un fichier dans `server/lib/services/` suffit à le rendre disponible, mais il faut **relancer `nuxt dev`** (le registre est généré au setup du module).

### 4.2 `defineRoute`

Remplace `defineEventHandler` pour les routes de l'API :

```ts
export default defineRoute({
  query: videosValidatorsSchema.list.query, // body, query, params : schémas Zod optionnels
  async handler(event, { query }) {
    const user = require_user(event);
    return services.videos.find_all(user, query);
  },
});
```

- Valide en parallèle `body`, `query` et `params` ; une entrée invalide renvoie un **400** avec les `issues` Zod.
- Type les entrées du handler à partir des schémas.
- Enveloppe le handler dans `withHttpErrors` (§5).

### 4.3 `defineValidator`

Les schémas sont regroupés par ressource dans `shared/validators/*.ts`, ce qui permet de les réutiliser côté front pour typer les filtres :

```ts
export const videosValidatorsSchema = defineValidator({ list: { query: z.object({ ... }) }, ... });
export type VideosValidators = InferValidators<typeof videosValidatorsSchema>;
// VideosValidators["list"]["query"] → type des filtres de /api/videos
```

### 4.4 `#framework/auth`

nuxt-auth-utils n'expose ses helpers serveur (`getUserSession`, `defineOAuthGoogleEventHandler`…) que via les auto-imports Nitro, désactivés ici. `build_auth.ts` les ré-exporte depuis leurs fichiers réels pour pouvoir les importer explicitement.

### 4.5 `useLogger`

Voir §14.

## 5. Cycle d'une requête API

```
Requête
  │
  ├─ plugin logger      : request_id (UUID), en-tête X-Request-Id, chrono
  ├─ plugin security    : en-têtes de sécurité + CSP stricte par défaut
  ├─ middleware session : cookie → session_id → `sessions` (+ cache) → event.context.user
  │
  ├─ route (defineRoute)
  │    ├─ validation Zod (400)
  │    ├─ require_user(event) (401) / require_recent_authentication (403)
  │    ├─ rate limiter éventuel (429)
  │    └─ services.xxx.yyy(...)
  │          └─ repositories @watcher/database
  │
  ├─ withHttpErrors : NotFoundError → 404, UnprocessableEntityError → 422, etc.
  └─ plugin logger (afterResponse) : une ligne par requête /api (méthode, chemin, statut, durée)
```

**Erreurs.** Les services et repositories ne connaissent pas H3 : ils lèvent des erreurs de `@watcher/common` (`NotFoundError`, `ConflictError`…). `withHttpErrors` les convertit en erreurs HTTP avec le bon statut et le message, qui est une **clé** (`video_not_found`, `sync_in_progress`, `too_many_attempts`…) traduite côté front.

`findOrFail(query, { message })` est le raccourci habituel pour « charger ou 404 ».

## 6. Authentification et sessions

### 6.1 Méthodes de connexion

Il n'y a **pas de mot de passe**. On se connecte avec :

- **Google** (`/api/oauth/google`) : scopes `youtube.readonly` + `userinfo.profile`, `prompt=consent` pour toujours obtenir un refresh token ;
- **Twitch** (`/api/oauth/twitch`) ;
- **une passkey** (`/api/passkeys/authenticate`), enregistrable depuis les paramètres une fois connecté.

Un utilisateur peut lier Google et Twitch au même compte. Le premier login OAuth sans compte existant crée l'utilisateur.

### 6.2 Les deux niveaux de session

1. **Cookie scellé** (nuxt-auth-utils, chiffré avec `NUXT_SESSION_PASSWORD`) : contient un instantané de l'utilisateur et, dans la partie `secure` (jamais envoyée au client), le `session_id`.
2. **Table `sessions`** : la source de vérité. Une session révoquée ou expirée (7 jours) invalide le cookie, quel que soit son contenu.

À chaque requête `/api/*`, `server/middleware/session.ts` lit le `session_id`, charge l'utilisateur via `services.sessions.find_user` et le place dans `event.context.user`. Si la session n'existe plus, le cookie est effacé.

- Le résultat est mis en cache **30 s** (stockage Nitro `sessions`, LRU en mémoire). `forget_user(user_id)` vide ce cache quand l'utilisateur change (liaison d'une intégration, suppression…).
- `last_seen_at` n'est mis à jour qu'au plus toutes les 5 minutes.
- Le hook `sessionHooks.fetch` remplace l'utilisateur renvoyé par `GET /api/_auth/session` par celui de la base : le front ne voit jamais un utilisateur périmé.

`start_user_session` (dans `server/utils/session.ts`) crée la ligne en base, écrit le cookie et révoque l'éventuelle session précédente.

### 6.3 Ré-authentification

Les actions sensibles (supprimer le compte, lier ou délier une intégration, ajouter ou supprimer une passkey) exigent une authentification de **moins de 10 minutes** (`sessions.authenticated_at`). Sinon l'API renvoie `403 reauthentication_required` et le front ouvre `ReauthenticationModal`, qui relance un OAuth ou une passkey.

### 6.4 « Intention » OAuth

Un même callback OAuth peut servir à se connecter, à **lier** un compte, ou à se **ré-authentifier**. Pour distinguer ces cas sans faire confiance au callback, `server/utils/oauth.ts` stocke une `oauth_intent` (fournisseur, but, expiration à 10 min) dans la partie `secure` de la session au **démarrage** du flux (`?integration=true` ou `?reauthenticate=true`), et la consomme au retour. Un utilisateur connecté qui revient d'un OAuth **sans intention** est refusé (`link_not_requested`) : cela empêche un attaquant de faire lier son compte Google à la session d'une victime.

### 6.5 Tokens des fournisseurs

Les tokens Google/Twitch sont stockés dans `credentials`, **chiffrés en AES-256-GCM** (`server/utils/encryption.ts`), avec une clé distincte pour l'access token et le refresh token. Ils sont révoqués chez le fournisseur à la déconnexion d'une intégration et à la suppression du compte.

## 7. Base de données

### 7.1 Package `@watcher/database`

```
packages/database/
├── kysely.config.ts      Config kysely-ctl (migrations)
├── migrations/           Une migration par fichier, horodatée
├── src/
│   ├── database.ts       useDatabase() (pool pg, max 10), types des tables, transactions
│   ├── helpers.ts        withTransaction, findOrFail, expectNotExists
│   ├── types.ts          Interface des tables (UserTable, VideoTable…)
│   └── repositories/     Une fonction par requête, regroupées par table
└── types/                Types d'entrée/sortie de chaque fonction de repository
```

Les repositories sont des **modules de fonctions** (`videos.find_all_for_user(...)`), exportés en namespaces (`import { videos } from "@watcher/database"`). Chaque fonction prend un objet unique `{ ...params, options?: { tx } }` dont le type est déclaré dans `types/<table>.ts`.

**Transactions.** `withTransaction(async (tx) => ...)` fournit un `TransactionHandle` **opaque** : un service ne peut que le transmettre à des repositories, jamais requêter avec. Seul le code du package sait le reconvertir (`resolveDatabase(options)`).

**Migrations.**

```bash
pnpm --filter @watcher/database db:migrations:run       # migrate up
pnpm --filter @watcher/database db:migrations:rollback  # migrate down
pnpm --filter @watcher/database db:migrations:create <nom>
```

Elles lisent `apps/client/.env`. Les migrations ne sont pas lancées automatiquement au démarrage de l'app.

### 7.2 Modèle de données

```
users ──┬──< credentials        (service, service_id) unique ; tokens chiffrés
        ├──< passkeys
        ├──< sessions
        ├──< user_subscriptions >── subscriptions ──< videos
        ├──< hidden_users_videos >───────────────────── videos
        └──< users_videos_progression >──────────────── videos

rate_limits, webauthn_challenges   (tables techniques, purgées toutes les heures)
```

| Table                      | Rôle                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `users`                    | Nom, `is_onboarded`, dates                                                            |
| `credentials`              | Un compte Google ou Twitch lié à un utilisateur                                       |
| `subscriptions`            | Une **chaîne** (YouTube ou Twitch), **partagée entre utilisateurs** ; `slug` unique   |
| `user_subscriptions`       | Lien utilisateur ↔ chaîne, avec `is_favorite` et `is_hidden`                          |
| `videos`                   | Une vidéo ou VOD, partagée ; miniatures, `palette` (jsonb), `title_search` (tsvector) |
| `hidden_users_videos`      | Vidéos masquées par un utilisateur                                                    |
| `users_videos_progression` | Progression de lecture (0 → 1), `updated_at` pour trier « en cours »                  |
| `sessions`                 | Sessions actives (voir §6)                                                            |

Points à connaître :

- Les identifiants sont des **UUID v7** (`UUIDV7()` en base), triables chronologiquement.
- `videos.subscription_id` contient l'**id de la chaîne chez le fournisseur**, pas `subscriptions.id` : la jointure se fait sur `(service, service_id)`.
- Les chaînes et les vidéos sont communes à tous les utilisateurs ; ce qui est propre à un utilisateur (favori, masquage, progression) est dans les tables de liaison.
- Une vidéo supprimée emporte sa progression et son masquage (`ON DELETE CASCADE`).

### 7.3 Requête du fil de vidéos

`videos.find_all_for_user` (la requête principale de l'app) part de `select_visible_for_user`, partagé entre la page et le compteur :

- vidéos des chaînes suivies et **non masquées** ;
- sans les vidéos masquées (sauf `with_hidden`) ni les vidéos vues entièrement (sauf `with_watched`) ;
- filtres : service, favoris, durée, date, chaîne, « en cours », recherche (`websearch_to_tsquery('french')` sur `title_search`, ou `ILIKE` en repli).

Pagination : `page`/`per_page` classique, ou **par curseur** avec `before=<video_id>` (comparaison `(created_at, id) <`), utilisée par le défilement infini. On lit `per_page + 1` lignes pour savoir s'il y a une page suivante (`has_more`) sans `COUNT`.

## 8. Intégrations YouTube et Twitch

`packages/google` et `packages/twitch` ont la même structure :

```
src/
├── index.ts              createClient(settings)
├── internal/client.ts    Client : settings + sous-services (youtube, videos, followers…)
├── internal/service.ts   perform_request(service_id, cb) : token valide + refresh
├── internal/oauth.ts     refresh / révocation
└── <ressource>.ts        Un service par ressource d'API
```

**Gestion des tokens.** Les packages ne savent pas où sont stockés les tokens. Le client reçoit deux callbacks, branchés dans `server/lib/google.ts` et `server/lib/twitch.ts` :

- `onRequest(service_id)` : renvoie les tokens (cache Nitro `oauth_tokens` en mémoire, sinon lecture en base et déchiffrement) ;
- `onRefreshToken({ service_id, tokens })` : enregistre les nouveaux tokens chiffrés en base et vide le cache.

`perform_request` rafraîchit l'access token s'il expire dans moins d'une minute. Les refresh concurrents pour un même compte sont **dédoublonnés** (`pending_refreshes`).

**Appels sortants.** Tous les appels HTTP sortants étalent `request_options()` de `@watcher/common` : timeout 10 s, 3 nouvelles tentatives avec backoff exponentiel sur les erreurs transitoires (408, 429, 5xx, timeouts). Les appels qui ne doivent jamais être rejoués (refresh de token) passent `{ retry: 0 }`.

Spécificités Twitch : la lecture d'une VOD passe par l'API **GQL** du lecteur Twitch (`NUXT_OAUTH_TWITCH_PLAYER_CLIENT_ID`) pour reconstruire la master playlist HLS (voir §11).

## 9. Synchronisation

La synchronisation importe les abonnements d'un utilisateur et les dernières vidéos de chaque chaîne. Elle est déclenchée **manuellement** :

- `POST /api/subscriptions/sync` ;
- `POST /api/users/me/onboard` avec `sync: true`, à la fin de l'onboarding.

Elle tourne **dans la requête HTTP** et peut durer plusieurs minutes.

### 9.1 Garde-fous

`guard_subscriptions_sync` (`server/utils/sync.ts`) :

- un **verrou** par utilisateur (`subscriptions_sync_lock`, rate limit à 1) : une seconde synchro simultanée renvoie `409 sync_in_progress` ;
- au plus **2 synchros par heure** (`subscriptions_sync`).

### 9.2 Déroulé

`services.subscriptions.sync(user)` lance YouTube et Twitch **en parallèle**, selon les intégrations liées. Les deux services (`server/lib/services/sync/*.ts`) suivent le même schéma de « diff » :

```
1. Abonnements connus en base  → tous marqués "deleted"
2. Abonnements chez le fournisseur (paginés)
      connu   → "updated"
      inconnu → "created"
3. Pour chaque abonnement (10 à la fois, async_pool) :
      "deleted" → detach (l'utilisateur ne suit plus la chaîne)
      sinon     → logo (téléchargement conditionnel)
                  upsert de la chaîne + attach, dans une transaction
                  vidéos de la chaîne :
                     connues en base → "deleted", puis même diff
                     "deleted" → suppression en base + miniatures
                     autres    → miniature small + palette, puis upsert_many
```

Une erreur sur une chaîne est journalisée et n'interrompt pas les autres.

**YouTube.** `subscriptions.list?mine=true`, puis pour chaque chaîne les 50 derniers uploads (`videos.get_latests`). Les **shorts sont exclus** : chaque nouvelle vidéo est testée avec un `HEAD youtube.com/shorts/:id` (200 = short, redirection vers `/watch` = vidéo), limité à 10 requêtes concurrentes. Une vidéo sortie des 50 derniers uploads est supprimée.

**Twitch.** `channels/followed` + `users` (pour les logos), puis toutes les VOD de chaque chaîne. Une VOD absente de la réponse (expirée) est supprimée.

Les limites et pistes d'amélioration (RSS YouTube, détection des lives Twitch, synchro par chaîne en tâche de fond) sont détaillées dans `docs/internal/PERFORMANCE.md`, `YOUTUBE.md` et `TWITCH.md`.

## 10. Images

Les logos et miniatures ne sont **jamais servis depuis les CDN des fournisseurs** : ils sont téléchargés, redimensionnés et convertis en **AVIF** par sharp, puis stockés.

| Taille  | Dimensions | Quand                                                              |
| ------- | ---------- | ------------------------------------------------------------------ |
| `logo`  | 192×192    | À la synchro                                                       |
| `small` | 480×270    | À la synchro                                                       |
| `large` | 700×394    | **À la demande**, au premier affichage (page vidéo, mise en avant) |

**Stockage** (`server/lib/images_storage.ts`), choisi par `NUXT_IMAGES_DRIVER` :

- `filesystem` : `.storage/uploads/`, servi par `server/routes/uploads/[...path].get.ts` ;
- `s3` : n'importe quel fournisseur compatible S3 (Scaleway, R2, MinIO, Garage), sans ACL (le bucket est public en lecture), 16 requêtes concurrentes max. Les URL publiques pointent directement sur le bucket.

Les clés suivent l'arborescence `<service>/channels/<channel_id>/logo.avif` et `<service>/channels/<channel_id>/videos/<video_id>_<small|large>.avif`. En base, on stocke le chemin **sans extension**, `public_image_url()` produit l'URL finale.

**Téléchargement conditionnel** (`sync_image`) : `If-None-Match` avec l'ETag enregistré, ou `If-Modified-Since` avec la date du fichier stocké. Un `304` évite le téléchargement. Les réponses sont limitées à 5 Mo, aux types JPEG/PNG/WebP et à 4096×4096 pixels décodés.

**Grande miniature à la demande.** Tant qu'elle n'existe pas, l'API renvoie `/api/videos/:id/thumbnails/large` comme URL ; cette route la génère depuis `thumbnail_large_source`, l'enregistre et **redirige** (302) vers l'image. Les générations concurrentes d'une même vidéo sont dédoublonnées. Quand la petite miniature change, la grande est supprimée et sera régénérée.

**Palette.** `server/utils/palette.ts` échantillonne la petite miniature (48×27) et calcule une palette (couleur de base, variantes `vivid`/`light`/`dark`/`ink`, et trois couleurs par tiers horizontal). Stockée dans `videos.palette`, elle colore l'ambiance du lecteur et des cartes (`AppAmbient`, `useAmbient`).

## 11. Lecture des vidéos

`GET /api/videos/:id/url` (60 appels/min par utilisateur) renvoie la source à lire.

**YouTube.** Le lecteur Video.js embarque `youtube-nocookie.com/embed/<id>` (`@videojs/youtube-video`).

**Twitch.** Les VOD Twitch ne sont pas lisibles directement depuis le navigateur (pas de CORS sur le CDN). Le serveur :

1. reconstruit la **master playlist HLS** à partir des métadonnées GQL de la VOD, en testant les qualités disponibles (mise en cache 5 min) ;
2. réécrit chaque URL de qualité en URL de **proxy signée** : `/api/videos/:id/segments/:quality/:path?base_url=…&expires=…&signature=…` ;
3. la route `segments` vérifie la signature (HMAC-SHA256, liée à la vidéo **et à l'utilisateur**, valable 24 h), puis :
   - pour une playlist `.m3u8` : la télécharge (cache 5 min), et réécrit à nouveau chaque segment en URL signée ;
   - pour un segment `.ts`/`.mp4` : le **stream** depuis le CDN sans le mettre en mémoire (50 Mo max).

Seuls les hôtes Twitch (`*.cloudfront.net`, `*.twitch.tv`, `*.ttvnw.net`) en HTTPS peuvent être proxifiés. La clé HMAC est dérivée (HKDF) de la clé de chiffrement des access tokens.

**Progression.** `useVideoProgression` reprend la lecture à la dernière position, puis l'enregistre (`POST /api/videos/:id/progress`, avec `keepalive`) toutes les 30 s, à la pause, après un seek, en fin de vidéo, et quand l'onglet est masqué ou la page quittée. Côté serveur, au-delà de 90 %, la vidéo est considérée comme vue (`progression = 1`) et disparaît du fil. `GET /api/videos/:id/next` propose la suite (les vidéos voisines dans le fil).

## 12. Front-end

### 12.1 Pages et navigation

| Route                  | Contenu                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `/`                    | Tableau de bord : en cours, favoris, timeline groupée par période |
| `/videos`              | Grille filtrable (service, durée, date, favoris, masquées…)       |
| `/videos/:id`          | Lecteur, description, « à suivre » avec compte à rebours          |
| `/subscriptions/:slug` | Page d'une chaîne                                                 |
| `/settings`            | Intégrations, passkeys, sessions actives, suppression du compte   |
| `/onboarding`          | Liaison des services et première synchro                          |
| `/auth/login`          | Connexion                                                         |

`app/middleware/auth.global.ts` redirige vers `/auth/login` sans session, et vers `/onboarding` tant que `is_onboarded` est faux.

### 12.2 Accès aux données

- **`useAppFetch`** : `useFetch` typé avec un addon qui transforme une erreur de lecture en **page d'erreur** (sauf 422 ou `fatal: false`). Utilisé dans les composables de lecture (`useVideos`, `useSubscriptions`, `useVideo`…).
- **`callApi`** : pour les mutations. Ne lève pas d'exception, renvoie `{ data, error }` ; peut rattacher l'erreur à un formulaire (`form`), et formate un message pour les 429.
- **`useInfiniteVideos`** : défilement infini avec pagination par curseur (`before`) et `IntersectionObserver`.

Les types de réponse viennent de `@watcher/common` (`VideoListResource`, `Page<T>`…) et les types de filtres des validateurs partagés (`VideosValidators["list"]["query"]`).

### 12.3 UI

- Les composants génériques viennent de `@watcher/ui`, préfixés `Watcher` (`WatcherButton`, `WatcherModal`, `WatcherCommandPalette`…), basés sur reka-ui et Tailwind 4. L'app étend le thème via `watcherUi.css`.
- Thème sombre par défaut (`@nuxtjs/color-mode`).
- Recherche globale (`ContentSearch`, `useGlobalSearch`) dans une palette de commandes, raccourcis clavier (`useShortcuts`, aide avec `?`).
- i18n : en, fr, es, sans préfixe d'URL ; la langue est détectée puis mémorisée dans le cookie `watcher_locale`. Les messages communs sont dans `packages/i18n`, ceux de l'app dans `apps/client/i18n/locales`.

## 13. Sécurité

| Mesure                                                                        | Où                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------ |
| En-têtes (HSTS, nosniff, X-Frame-Options, COOP, CORP, Permissions-Policy)     | `server/plugins/security.ts`                     |
| CSP `default-src 'none'` pour l'API, CSP avec **nonce** par page pour le HTML | `server/plugins/security.ts`                     |
| Sessions révocables côté serveur                                              | §6.2                                             |
| Ré-authentification < 10 min pour les actions sensibles                       | §6.3                                             |
| Intention OAuth (anti-liaison forcée)                                         | §6.4                                             |
| Tokens fournisseurs chiffrés AES-256-GCM                                      | `server/utils/encryption.ts`                     |
| Rate limiting persistant en base                                              | `server/lib/rate_limiter.ts`                     |
| Proxy vidéo signé, lié à l'utilisateur, hôtes en liste blanche                | `server/utils/proxy.ts`                          |
| Téléchargements bornés (taille, type, pixels)                                 | `server/utils/http.ts`, `server/utils/images.ts` |
| Secrets masqués dans les logs                                                 | `modules/framework/utils/use_logger.ts`          |

Limites du rate limiter (`RATE_LIMITS`) :

| Clé                       | Limite     | Par         |
| ------------------------- | ---------- | ----------- |
| `oauth`                   | 20 / min   | IP          |
| `passkeys_authenticate`   | 20 / min   | IP          |
| `passkeys_register`       | 10 / h     | utilisateur |
| `subscriptions_sync`      | 2 / h      | utilisateur |
| `subscriptions_sync_lock` | 1 (verrou) | utilisateur |
| `video_url`               | 60 / min   | utilisateur |

## 14. Logs, tâches et stockage Nitro

### Logs

`useLogger("<service>")` renvoie un logger pino enfant. Chaque ligne porte automatiquement le `request_id` et le `user_id` de la requête en cours (via `asyncContext`), ce qui permet de suivre une requête de bout en bout.

- En local : sortie console avec pino-pretty, niveau `debug`.
- Ailleurs : fichiers journaliers dans `.storage/logs/{error,info,debug}`, rotation à 100 Mo, 30 fichiers conservés, niveau `info`.
- `NUXT_LOG_LEVEL` force le niveau.
- Les clés sensibles (`access_token`, `refresh_token`, `cookie`, `authorization`…) sont remplacées par `[redacted]`.

Le plugin `logger` écrit une ligne par requête `/api` (niveau selon le statut) et chaque erreur non gérée.

### Tâches Nitro

| Tâche             | Déclenchement     | Rôle                                                          |
| ----------------- | ----------------- | ------------------------------------------------------------- |
| `database:purge`  | toutes les heures | Supprime sessions, rate limits et challenges WebAuthn expirés |
| `images:migrate`  | manuel            | Migration ponctuelle des images (JPEG → AVIF, disque → S3)    |
| `videos:palettes` | manuel            | Calcule les palettes manquantes                               |

Lancement manuel en dev : `GET /_nitro/tasks/<nom>`.

### Stockage Nitro (en mémoire, par processus)

| Store          | Contenu                                                |
| -------------- | ------------------------------------------------------ |
| `oauth_tokens` | Tokens déchiffrés des fournisseurs                     |
| `sessions`     | Utilisateur d'une session, TTL 30 s                    |
| `cache`        | `defineCachedFunction` (playlists Twitch), 500 entrées |

Ces caches sont **locaux au processus** : avec plusieurs instances, une révocation de session peut mettre jusqu'à 30 s à être vue par les autres.

## 15. Configuration et outillage

### Variables d'environnement

Voir `apps/client/.env.example`. Les groupes principaux :

| Préfixe                                      | Usage                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `NUXT_PUBLIC_ENVIRONMENT`                    | `local` ou `production` (logs, niveau par défaut)                                        |
| `NUXT_SITE_URL`                              | URL publique (sert aussi d'identifiant WebAuthn)                                         |
| `NUXT_SESSION_PASSWORD`                      | Secret du cookie de session (nuxt-auth-utils), généré automatiquement dans `.env` en dev |
| `NUXT_DATABASE_*`                            | Connexion PostgreSQL (lue aussi par les migrations)                                      |
| `NUXT_OAUTH_GOOGLE_*`, `NUXT_OAUTH_TWITCH_*` | Applications OAuth (+ client id du lecteur Twitch)                                       |
| `NUXT_ENCRYPTION_CREDENTIALS_*`              | Clés AES (hex, 32 octets) : `pnpm generate:secret`                                       |
| `NUXT_IMAGES_*`                              | Driver d'images et configuration S3                                                      |

### Commandes

```bash
pnpm install                          # à la racine
pnpm --filter watcher dev             # app sur http://localhost:3000
pnpm --filter watcher typecheck
pnpm --filter @watcher/database db:migrations:run
pnpm lint && pnpm format              # lancés aussi par le hook pre-commit
```

## 16. Conventions de code

- **Imports explicites côté serveur.** Les auto-imports Nitro sont désactivés : tout s'importe depuis `nuxt/server`, `nitropack/runtime`, `#framework`, `#framework/auth`, `#server/...`. Côté front (`app/`), les auto-imports Nuxt restent actifs.
- **Alias plutôt que chemins relatifs** vers `shared/` et `server/` : imposé par la règle oxlint locale `nuxt-imports/import-alias` (`shared/utils/oxlint_import_alias.js`), qui corrige automatiquement.
- **Nommage** : `snake_case` pour les variables, fonctions et méthodes du code métier (`find_all_for_user`, `require_user`), `camelCase` pour les API de framework (`defineRoute`, `useLogger`, composables `useXxx`). Ne jamais masquer un global natif (`fetch`…) : renommer (`request_fetch`).
- **Couches** : route → service → repository. Une route ne touche pas la base directement ; un repository ne connaît pas H3 ni l'utilisateur de session.
- **Erreurs** : lever une erreur de `@watcher/common` dans les services, avec une clé de message traduisible.
- **Appels sortants** : toujours étaler `request_options()` pour rendre timeout et retries visibles à l'appel.
- **Logs** : un `useLogger` nommé d'après le fichier (`services.sync.youtube`), des champs structurés plutôt que des messages interpolés.
