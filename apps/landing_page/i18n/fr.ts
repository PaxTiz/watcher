import type en from "./en";

export default {
  page: {
    home: "Accueil",
  },

  nav: {
    features: "Fonctionnalités",
    overview: "Aperçu",
    faq: "FAQ",
    login: "Connexion",
    openMenu: "Ouvrir le menu",
  },

  theme: {
    system: "Système",
    light: "Clair",
    dark: "Sombre",
  },

  language: {
    label: "Langue",
    fr: "Français",
    en: "English",
    es: "Español",
  },

  hero: {
    live: "En direct",
    titleTemplate: "Retrouve tous tes {creators} réunis dans un seul {feed}",
    titleCreators: "créateurs préférés",
    titleFeed: "flux unifié",
    subtitle:
      "Watcher réunit tes abonnements Twitch et YouTube dans une interface unique. Plus besoin de jongler entre les plateformes pour ne rien rater.",
    ctaStart: "Commencer",
    ctaDemo: "Voir la démo",
  },

  channelsOverview: {
    title: "Tous tes abonnements au même endroit",
    description:
      "Watcher regroupe l'ensemble des vidéos YouTube et Twitch de tous tes créateurs préférés dans un seul et même flux unifié.",
    live: "LIVE",
    videos: {
      todaySession: "Session ranked",
      todayBestMoments: "Best moments #12",
      todayJustChatting: "Just chatting",
      todayFullVod: "VOD complet",
      todaySpeedrun: "Speedrun%",
      yesterdayLetsPlay: "Let's play ep.4",
      yesterdayEveningDraft: "Draft du soir",
      yesterdayReactionClip: "Réaction — clip",
      yesterdaySundayCoop: "Co-op du dimanche",
      yesterdayWeeklyRecap: "Résumé de la semaine",
    },
  },

  mainFeatures: {
    title: "Fait pour suivre, pas pour chercher",
    description: "Quatre idées simples pensées pour te faire gagner du temps chaque jour.",
    unifiedFeed: {
      title: "Flux unifié",
      description:
        "Vidéos, lives et VOD de Twitch et YouTube rassemblés dans une seule timeline, triée par récence.",
    },
    simpleInterface: {
      title: "Interface simple",
      description:
        "Aucune surcharge, aucun réglage compliqué. Tu ouvres l'app, tu vois ce qui est nouveau.",
    },
    integratedPlayer: {
      title: "Lecteur intégré",
      description: "Regarde directement dans Watcher, sans changer d'onglet.",
    },
    channelGrouping: {
      title: "Regroupement de chaînes",
      description: "Fusionne les chaînes Twitch et YouTube d'un même créateur — voir plus bas ↓",
    },
  },

  channelsGrouping: {
    title: "Une seule entité, plusieurs chaînes",
    description:
      "Beaucoup de créateurs diffusent en direct sur Twitch et publient leurs rediffusions sur une chaîne YouTube dédiée. Avec Watcher, tu regroupes ces chaînes en une seule entité : plus de doublons, plus de confusion, juste le bon créateur.",
    bullets: {
      groupAny: "Regroupe autant de chaînes que tu veux par créateur",
      oneFeed: "Un seul flux, une seule notification, un seul profil",
      idealForStreamers: "Idéal pour les streamers Twitch avec chaîne replay YouTube",
    },
    liveStatus: "live",
    replaysLabel: "Rediffusions",
    mergeLabel: "FUSION",
    mergedSummary: "1 entité · 2 chaînes",
  },

  platformViewer: {
    title: "Ta liste de créateurs, enfin lisible",
    description:
      "Un panneau latéral avec toutes tes chaînes, un badge pour les lives en cours, et un aperçu vidéo au survol. Tu ne rates plus jamais une sortie.",
    screenshotAlt: "capture d'écran — panneau créateurs",
    liveBadge: "Badge « en direct » en temps réel",
    filters: "Filtres par plateforme ou créateur",
    sync: "Synchronisation automatique",
  },

  faq: {
    title: "Questions fréquentes",
    items: {
      isAppFree: {
        label: "L'app est-elle gratuite ?",
        content:
          "Oui, Watcher est gratuit pour commencer. Une offre premium sans publicité et avec des filtres avancés arrivera plus tard.",
      },
      howSyncWorks: {
        label: "Comment fonctionne la synchronisation ?",
        content:
          "Tu connectes tes comptes Twitch et YouTube en quelques clics, Watcher récupère automatiquement tes abonnements et les met à jour en continu.",
      },
      areCredentialsSafe: {
        label: "Mes identifiants sont-ils en sécurité ?",
        content:
          "Watcher utilise uniquement les connexions officielles Twitch et YouTube (OAuth) — nous ne stockons jamais ton mot de passe.",
      },
      platformAccess: {
        label: "Quand aurai-je accès à la bêta ?",
        content:
          "Les invitations sont envoyées par vagues chaque semaine. Plus tôt tu t'inscris, plus tôt tu reçois ton accès.",
      },
    },
  },

  footer: {
    title: "Rejoins la bêta et simplifie ton suivi dès aujourd'hui",
    description: "Connecte un compte, teste Watcher gratuitement, sans engagement.",
    ctaTwitch: "Continuer avec Twitch",
    ctaYoutube: "Continuer avec YouTube",
    copyright: "© 2026 Watcher. Non affilié à Twitch Interactive ou YouTube LLC.",
    privacy: "Confidentialité",
    terms: "Conditions",
    contact: "Contact",
  },
} satisfies typeof en;
