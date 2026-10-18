import type { Channel, CommandItem, SearchFilters, SearchResults, Video } from "@watcher/ui";

/* ---------- Miniatures générées localement (aucun appel réseau) ---------- */

const thumb = (hue: number, label: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='hsl(${hue} 70% 55%)'/>
      <stop offset='1' stop-color='hsl(${(hue + 50) % 360} 70% 32%)'/>
    </linearGradient></defs>
    <rect width='320' height='180' fill='url(#g)'/>
    <text x='160' y='100' text-anchor='middle' font-family='sans-serif' font-size='30' fill='white' fill-opacity='.85'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

type MockVideo = Video & { publishedAt: number };

const DAY = 86_400_000;
const now = Date.now();

const DB: MockVideo[] = [
  {
    id: "1",
    title: "Vue 3 en 10 minutes : tout ce qu'il faut savoir",
    author: "Code & Café",
    duration: 612,
    views: 184_000,
    publishedAt: now - 3 * DAY,
    thumbnail: thumb(150, "Vue 3"),
  },
  {
    id: "2",
    title: "Nuxt 4 : les nouveautés expliquées",
    author: "Alice Dev",
    duration: 1_485,
    views: 52_300,
    publishedAt: now - 1 * DAY,
    thumbnail: thumb(200, "Nuxt 4"),
  },
  {
    id: "3",
    title:
      "Tailwind CSS v4 : migration complète d'un vrai projet, étape par étape, avec tous les pièges rencontrés en production",
    author: "Front en Vrac",
    duration: 2_730,
    views: 9_800,
    publishedAt: now - 20 * DAY,
    thumbnail: thumb(260, "Tailwind"),
  },
  {
    id: "4",
    title: "TypeScript : 5 astuces en 3 minutes",
    author: "Code & Café",
    duration: 185,
    views: 421_000,
    publishedAt: now - 60 * DAY,
    thumbnail: thumb(210, "TS"),
  },
  {
    id: "5",
    title: "Reka UI : construire des composants accessibles",
    author: "Lucas Martin",
    duration: 934,
    views: 12_400,
    publishedAt: now - 7 * DAY,
    thumbnail: thumb(20, "Reka UI"),
  },
  {
    id: "6",
    title: "Design system from scratch",
    author: "Studio Pixel",
    duration: 3_920,
    views: 76_000,
    publishedAt: now - 120 * DAY,
    thumbnail: thumb(320, "Design"),
  },
  {
    id: "7",
    title: "Pinia vs Vuex : lequel choisir ?",
    author: "Alice Dev",
    duration: 420,
    views: 33_900,
    publishedAt: now - 200 * DAY,
    thumbnail: thumb(90, "Pinia"),
  },
  {
    id: "8",
    title: "Animer ses interfaces avec CSS",
    author: "Front en Vrac",
    duration: 755,
    views: 61_700,
    publishedAt: now - 15 * DAY,
    thumbnail: thumb(40, "CSS"),
  },
  {
    id: "9",
    title: "Vite : pourquoi c'est si rapide",
    author: "Lucas Martin",
    duration: 228,
    views: 148_000,
    publishedAt: now - 45 * DAY,
    thumbnail: thumb(280, "Vite"),
  },
  {
    id: "10",
    title: "Live : revue de code en direct",
    author: "Studio Pixel",
    duration: 5_400,
    views: 2_100,
    publishedAt: now - 2 * DAY,
    thumbnail: thumb(0, "Live"),
  },
  // Sans durée ni vues : teste l'affichage des champs optionnels
  {
    id: "11",
    title: "Vidéo sans métadonnées",
    author: "Auteur inconnu",
    publishedAt: now - 400 * DAY,
    thumbnail: thumb(180, "?"),
  },
  // Cas pathologique : miniature cassée
  {
    id: "12",
    title: "Miniature introuvable",
    author: "Test",
    duration: 90,
    views: 15,
    publishedAt: now - 5 * DAY,
    thumbnail: "/404.jpg",
  },
];

/* ---------- Chaînes ---------- */

const avatar = (hue: number, initials: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>
    <rect width='96' height='96' fill='hsl(${hue} 60% 45%)'/>
    <text x='48' y='60' text-anchor='middle' font-family='sans-serif' font-size='34' fill='white'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const CHANNELS: Channel[] = [
  {
    id: "c1",
    name: "Code & Café",
    handle: "@codeetcafe",
    avatar: avatar(150, "CC"),
    subscribers: 284_000,
  },
  {
    id: "c2",
    name: "Alice Dev",
    handle: "@alicedev",
    avatar: avatar(200, "AD"),
    subscribers: 96_500,
  },
  {
    id: "c3",
    name: "Front en Vrac",
    handle: "@frontenvrac",
    avatar: avatar(260, "FV"),
    subscribers: 41_200,
  },
  {
    id: "c4",
    name: "Lucas Martin",
    handle: "@lucasmartin",
    avatar: avatar(20, "LM"),
    subscribers: 17_800,
  },
  {
    id: "c5",
    name: "Studio Pixel",
    handle: "@studiopixel",
    avatar: avatar(320, "SP"),
    subscribers: 512_000,
  },
  // Sans handle ni abonnés : teste les champs optionnels
  { id: "c6", name: "Nouvelle chaîne", avatar: avatar(30, "N") },
];

/* ---------- Fonction de recherche mockée ---------- */

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const delay = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

/**
 * Cas de test :
 *  - "tout"   → renvoie toutes les chaînes et vidéos
 *  - "erreur" → simule une erreur réseau
 *  - "lent"   → latence de 3 s (barre de chargement / annulation)
 *  - "vide"   → aucun résultat (état vide)
 *  - autre    → filtre sur nom/titre/auteur
 */
export async function mockSearch(
  query: string,
  filters: SearchFilters,
  signal: AbortSignal,
): Promise<SearchResults> {
  const q = normalize(query);
  await delay(q === "lent" ? 3000 : 500, signal);

  if (q === "erreur") throw new Error("Network error");
  if (q === "vide") return { channels: [], videos: [] };

  const terms = q.split(/\s+/);
  const matches = (text: string) => q === "tout" || terms.every((t) => normalize(text).includes(t));

  const channels =
    filters.type === "videos" ? [] : CHANNELS.filter((c) => matches(`${c.name} ${c.handle ?? ""}`));

  const videos =
    filters.type === "channels"
      ? []
      : DB.filter((v) => matches(`${v.title} ${v.author}`)).filter((v) => {
          if (filters.duration === "any" || v.duration == null) return true;
          if (filters.duration === "short") return v.duration < 240;
          if (filters.duration === "medium") return v.duration >= 240 && v.duration <= 1200;
          return v.duration > 1200;
        });

  if (filters.sort === "recent") videos.sort((a, b) => b.publishedAt - a.publishedAt);
  if (filters.sort === "views") videos.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));

  return { channels, videos: videos.map(({ publishedAt, ...video }) => video) };
}

/* ---------- Items pour tester la CommandPalette générique ---------- */

export const mockCommands: CommandItem<{ to: string }>[] = [
  { id: "home", label: "Accueil", group: "Navigation", keywords: ["dashboard"], data: { to: "/" } },
  { id: "videos", label: "Mes vidéos", group: "Navigation", data: { to: "/videos" } },
  {
    id: "settings",
    label: "Paramètres",
    group: "Navigation",
    keywords: ["préférences", "config"],
    data: { to: "/settings" },
  },
  {
    id: "upload",
    label: "Importer une vidéo",
    group: "Actions",
    keywords: ["upload", "ajouter"],
    data: { to: "/upload" },
  },
  {
    id: "logout",
    label: "Se déconnecter",
    group: "Actions",
    keywords: ["logout"],
    data: { to: "/logout" },
  },
  {
    id: "admin",
    label: "Administration (réservé)",
    group: "Actions",
    disabled: true,
    data: { to: "/admin" },
  },
];
