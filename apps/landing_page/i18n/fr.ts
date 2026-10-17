import type en from "./en";

export default {
  a11y: {
    skipToContent: "Aller au contenu",
  },

  page: {
    home: "Accueil",
  },

  nav: {
    feed: "Le fil",
    player: "Le lecteur",
    how: "Comment ça marche",
    faq: "FAQ",
    login: "Se connecter",
    start: "Commencer",
  },

  theme: {
    label: "Thème",
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
    title: "Toutes tes chaînes",
    titleSoft: "Un seul endroit",
    lead: "Watcher réunit tes abonnements YouTube et Twitch dans un seul fil, dans l'ordre où les vidéos sortent. Sans algorithme.",
    ctaStart: "Commencer gratuitement",
    ctaHow: "Voir comment ça marche",
    note: "Gratuit · Lecture seule de tes abonnements",
  },

  showcase: {
    label: "Aperçu de l'application Watcher",
    search: "Rechercher",
    home: "Accueil",
    videos: "Vidéos",
    favorites: "Favoris",
    subscriptions: "Abonnements",
    greeting: "Bonjour Alex",
    resume: "Reprendre la lecture",
    resumeAction: "Reprendre",
    remaining: "12 min restantes",
    latest: "Nouveautés",
    searchCapsule: "Rechercher dans tes chaînes",
  },

  videos: {
    gps: "Trois jours sans GPS",
    ranked: "Session ranked, on vise le top 500",
    gameboy: "On a démonté une Game Boy",
    final: "VOD : la grande finale du tournoi",
    bread: "Le pain du dimanche, enfin réussi",
    trains: "Pourquoi les trains sont en retard",
    hooks: {
      gps: "SANS GPS",
      gameboy: "ON A OSÉ",
      bread: "ENFIN !",
      trains: "LE VRAI PRIX",
    },
    tags: {
      new: "Nouveau",
      live: "En direct",
      vod: "VOD",
    },
  },

  feed: {
    title: "Un seul fil",
    titleSoft: "Dans l'ordre où ça sort",
    lead: "Les vidéos et les lives de toutes tes chaînes, YouTube et Twitch confondus. Les plus récents en haut, rien d'autre.",
    today: "Aujourd'hui",
  },

  player: {
    title: "Regarde ici",
    titleSoft: "Reprends où tu t'étais arrêté",
    lead: "Le lecteur est intégré. Watcher retient où tu en es sur chaque vidéo et enchaîne sur la suivante quand tu veux.",
    resumedAt: "Repris à {time}",
    upNext: "À suivre",
    autoplay: "Lecture automatique",
    next: "Ensuite",
  },

  favorites: {
    title: "Tes favoris d'abord",
    titleSoft: "Le reste quand tu veux",
    lead: "Épingle les chaînes que tu ne veux pas rater. Masque celles qui encombrent ton fil, sans te désabonner.",
    favorites: "Favoris",
    subscriptions: "Abonnements",
    hidden: "Masquée",
  },

  how: {
    title: "Prêt en une minute",
    titleSoft: "Sans mot de passe à créer",
    connect: {
      title: "Connecte ton compte",
      text: "Google pour YouTube, Twitch, ou les deux. Watcher demande un accès en lecture seule.",
    },
    import: {
      title: "Tes abonnements arrivent",
      text: "Watcher importe tes chaînes et leurs dernières vidéos, puis suit les nouvelles.",
    },
    watch: {
      title: "Tu regardes",
      text: "Un fil, un lecteur, tes favoris. Tu peux tout déconnecter quand tu veux.",
    },
  },

  faq: {
    title: "Questions",
    titleSoft: "fréquentes",
    items: {
      free: {
        question: "Watcher est-il gratuit ?",
        answer:
          "Oui. Une offre premium viendra peut-être plus tard, sans rien retirer à la version gratuite.",
      },
      platforms: {
        question: "Quelles plateformes ?",
        answer: "YouTube et Twitch. Tu peux connecter l'une, l'autre ou les deux.",
      },
      access: {
        question: "Que peut faire Watcher sur mes comptes ?",
        answer:
          "Rien d'autre que lire la liste de tes abonnements. Il ne publie rien et ne voit jamais ton mot de passe.",
      },
      mobile: {
        question: "Ça marche sur mobile ?",
        answer: "Oui, directement dans le navigateur de ton téléphone.",
      },
    },
  },

  final: {
    title: "Tes chaînes t'attendent",
    titleSoft: "Il ne manque que toi",
    google: "Continuer avec Google",
    twitch: "Continuer avec Twitch",
    note: "Gratuit · Lecture seule · Supprimable à tout moment",
  },

  error: {
    notFound: {
      title: "Page introuvable",
      description: "La page que tu cherches n'existe pas ou a été déplacée.",
    },
    generic: {
      title: "Une erreur est survenue",
      description: "Une erreur inattendue s'est produite. Réessaie dans un instant.",
    },
    backHome: "Retour à l'accueil",
  },

  footer: {
    copyright: "© 2026 Watcher. Non affilié à YouTube ni à Twitch.",
    privacy: "Confidentialité",
    terms: "Conditions",
    contact: "Contact",
  },
} satisfies typeof en;
