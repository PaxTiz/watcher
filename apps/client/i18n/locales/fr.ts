import type en from "./en";

export default {
  meta: {
    description: "Watcher - Suivez tous vos créateurs favoris au même endroit",
  },

  nav: {
    label: "Navigation principale",
    breadcrumb: "Fil d'Ariane",
    home: "Accueil",
    videos: "Vidéos",
    favorites: "Favoris",
    my_favorites: "Mes favoris",
    subscriptions: "Abonnements",
    channels: "Chaînes",
    settings: "Paramètres",
    open_menu: "Ouvrir le menu",
    back: "Retour",
    expand: "Déplier",
    collapse: "Replier",
    expand_sidebar: "Déplier la barre latérale",
    collapse_sidebar: "Replier la barre latérale",
  },

  account: {
    label: "Compte",
    label_of: "Compte de {name}",
    logout: "Me déconnecter",
  },

  sync: {
    action: "Synchroniser",
    running: "Synchronisation en cours…",
    done: "Synchronisation terminée",
    failed: "La synchronisation a échoué, réessayez dans quelques minutes",
  },

  errors: {
    generic: "Une erreur est survenue, réessayez dans quelques instants",
    internal: "Une erreur interne s'est produite",
  },

  validation: {
    name_too_long: "Le nom ne doit pas dépasser 64 caractères",
  },

  auth: {
    title: "Connexion",
    headline: "Toutes vos chaînes, au même endroit.",
    benefits: {
      feed: "Vos abonnements YouTube et Twitch réunis dans un seul fil",
      order: "Dans l'ordre de leur sortie, sans algorithme qui trie pour vous",
      resume: "Reprenez chaque vidéo là où vous l'aviez laissée",
    },
    google: "Continuer avec Google",
    passkey: "Clé d'accès",
    no_account: "Pas encore de compte ?",
    signup_with_passkey: "Créer un compte avec une clé d'accès",
    read_only: "Accès en lecture seule à vos abonnements YouTube et Twitch.",
    preview: {
      title: "Un seul fil",
      text: "toutes vos chaînes, dans l'ordre de leur sortie",
    },
    signup: {
      title: "Créer un compte avec une clé d'accès",
      description:
        "Votre clé d'accès est enregistrée sur votre appareil ou dans votre gestionnaire de mots de passe. Aucun mot de passe à retenir.",
      name: "Votre nom",
      name_placeholder: "Jean",
      submit: "Créer mon compte",
    },
  },

  passkeys: {
    title: "Clés d'accès",
    description: "Connectez-vous avec l'empreinte, le visage ou le code de votre appareil.",
    name: "Nom de la clé d'accès",
    name_placeholder: "MacBook, iPhone, Bitwarden…",
    name_hint:
      "Donnez-lui un nom pour la reconnaître facilement, par exemple l'appareil ou le gestionnaire de mots de passe qui la conserve.",
    added_on: "Ajoutée le {date}",
    used_ago: "Utilisée {ago}",
    add: {
      title: "Ajouter une clé d'accès",
      supported: "Enregistrez une clé d'accès sur cet appareil.",
      unsupported: "Votre navigateur ne prend pas en charge les clés d'accès.",
      success: "Votre clé d'accès a été ajoutée",
    },
    rename: {
      title: "Renommer la clé d'accès",
      success: "La clé d'accès a été renommée",
      failed: "Le renommage de la clé d'accès a échoué, réessayez plus tard",
    },
    delete: {
      title: "Supprimer cette clé d'accès",
      description:
        "Vous ne pourrez plus vous connecter à Watcher avec cette clé d'accès. Pensez également à la supprimer de votre appareil ou de votre gestionnaire de mots de passe.",
      success: "La clé d'accès a été supprimée",
      failed: "La suppression de la clé d'accès a échoué, réessayez plus tard",
      last_login_method: "Associez un compte ou une autre clé d'accès avant de supprimer celle-ci",
    },
    errors: {
      already_registered: "Cette clé d'accès est déjà associée à votre compte",
      unknown: "Cette clé d'accès n'est associée à aucun compte Watcher",
      expired: "La demande a expiré, veuillez réessayer",
      login: "Une erreur est survenue lors de la connexion avec votre clé d'accès",
      signup: "Une erreur est survenue lors de la création de votre compte",
      add: "Une erreur est survenue lors de l'ajout de votre clé d'accès",
    },
  },

  dashboard: {
    description: "Découvrez les dernières sorties de vos créateurs favoris.",
    greeting: "Bonjour {name}",
    synced_ago: "Synchronisé {ago}",
    resume: "Reprendre la lecture",
    resume_action: "Reprendre",
    mark_as_watched: "Marquer comme visionnée",
    also_in_progress: "Aussi en cours",
    favorites: "Nouveautés de vos favoris",
    empty: {
      title: "Aucune vidéo à afficher.",
      description: "Lancez une synchronisation pour récupérer du contenu.",
    },
    loading_more: "Chargement de plus de vidéos…",
    groups: {
      today: "Aujourd'hui",
      yesterday: "Hier",
      weekly: "Cette semaine",
      monthly: "30 derniers jours",
      older: "Plus ancien",
    },
  },

  onboarding: {
    title: "Bienvenue",
    description: "Configurez vos accès et synchronisez vos abonnements en toute simplicité",
    heading: "Bienvenue sur Watcher",
    lead: "Associez vos comptes puis lancez une première synchronisation pour récupérer vos chaînes et leurs dernières vidéos.",
    link: {
      title: "Associez vos comptes",
      description: "Liez les plateformes de votre choix pour regrouper tous vos abonnements.",
    },
    sync: {
      title: "Synchronisez vos abonnements",
      description:
        "Watcher récupère vos abonnements sur les comptes associés et importe leurs dernières vidéos.",
      action: "Synchroniser mes abonnements",
      later: "Plus tard",
      stay: "Restez sur cette page, vous serez redirigé automatiquement.",
    },
  },

  integrations: {
    linked: "Connecté",
    unlinked: "Non connecté",
    link: "Associer",
    disconnect: {
      action: "Déconnecter",
      title: "Déconnexion de votre compte {name}",
      description:
        "Si vous déconnectez votre compte, vos abonnements ainsi que les vidéos liées à vos abonnements ne seront plus mis à jour.",
      success: "Le compte {name} a été déconnecté",
      failed: "Une erreur est survenue lors de la déconnexion de {name}",
    },
    oauth: {
      success: "Votre compte {provider} est désormais connecté",
      already_linked: "Ce compte {provider} est déjà lié à un autre compte Watcher.",
      failed: "Une erreur est survenue lors de la connexion à votre compte {provider}",
    },
  },

  settings: {
    heading: "Mon compte",
    linked_accounts: {
      title: "Comptes liés",
      description: "Vos abonnements YouTube et Twitch sont récupérés depuis ces comptes.",
    },
    interface: "Interface",
    account: "Compte",
    danger: "Zone de danger",
    delete_account: {
      title: "Supprimer mon compte",
      description: "Supprime définitivement votre compte, vos abonnements et votre historique.",
      confirm:
        "Votre compte, vos abonnements et votre historique seront supprimés définitivement. Cette action est irréversible.",
      success: "Votre compte a été supprimé",
      failed: "La suppression de votre compte a échoué, réessayez plus tard",
    },
  },

  subscriptions: {
    filter: "Filtrer {count} abonnements",
    filter_label: "Filtrer les abonnements",
    filter_by_service: "Filtrer par service",
    all_services: "Tous les services",
    hidden: "Masqué",
    new_video: "Nouvelle vidéo ces dernières 24 heures",
    empty: "Aucun abonnement trouvé.",
    logo: "Logo de {name}",
    discover: "Découvrez les dernières vidéos de {name}.",
    last_video: "Dernière vidéo {ago}",
    open_on: "Ouvrir sur {service}",
    search_in: "Rechercher dans {name}",
    search_in_label: "Rechercher dans les vidéos de {name}",
    favorite: {
      add: "Ajouter aux favoris",
      remove: "Retirer des favoris",
      active: "En favoris",
      added: "{name} a été ajouté à vos favoris",
      removed: "{name} a été retiré de vos favoris",
      failed: "La modification de vos favoris a échoué, réessayez plus tard",
    },
    hide: {
      action: "Masquer",
      show: "Réafficher",
      title: "Masquer la chaîne",
      description:
        "Les vidéos de {name} n'apparaîtront plus dans votre flux. Vous pourrez la réafficher depuis cette page.",
      notice: "Cette chaîne est masquée : ses vidéos n'apparaissent pas dans votre flux.",
      failed: "La modification de la chaîne a échoué, réessayez plus tard",
    },
  },

  videos: {
    description: "Explorez l'ensemble des vidéos de vos abonnements YouTube et Twitch.",
    favorites_title: "Vidéos de vos favoris",
    results_for: "Résultats pour « {query} »",
    count: "{n} vidéo | {n} vidéo | {n} vidéos",
    no_results: "Désolé, aucun résultat n'a été trouvé pour votre recherche.",
    watched: "Vue",
    new: "Nouveau",
    actions: "Actions sur la vidéo",
    video: "Vidéo",
    subscription: "Abonnement",
    published: "Publiée {ago} · {date}",
    watch_description: "Regarder la vidéo {title} de {author}, publiée le {date}.",
    mark_as_watched: {
      action: "Marquer comme vue",
      success: "La vidéo a été marquée comme vue",
      failed: "La vidéo n'a pas pu être marquée comme vue, réessayez plus tard",
    },
    hide: {
      action: "Masquer la vidéo",
      title: "Masquer une vidéo",
      description:
        "Voulez-vous vraiment masquer cette vidéo ? Elle n'apparaîtra plus dans votre flux.",
      hidden: "Vidéo masquée",
      hidden_description: "Elle n'apparaîtra plus dans votre flux.",
      success: "La vidéo a été masquée",
      failed: "Le masquage de la vidéo a échoué, réessayez plus tard",
    },
    hide_channel: {
      action: "Masquer la chaîne",
      title: "Masquer une chaîne",
      description:
        "Voulez-vous vraiment masquer cette chaîne ? L'historique ainsi que les nouvelles vidéos publiées par cette chaîne ne seront plus visibles dans votre flux.",
      hidden: "Chaîne masquée",
      hidden_description: "Ses vidéos n'apparaîtront plus dans votre flux.",
      success: "La chaîne a été masquée",
      failed: "Le masquage de la chaîne a échoué, réessayez plus tard",
    },
    favorite: {
      added: "L'abonnement a été ajouté à vos favoris",
      removed: "L'abonnement a été retiré de vos favoris",
    },
    up_next: {
      title: "À suivre",
      autoplay: "Lecture automatique",
      next: "Ensuite",
      empty: "Aucune autre vidéo de cette chaîne pour le moment.",
    },
    countdown: {
      label: "Vidéo suivante",
      remaining: "Vidéo suivante dans {seconds} s",
      play_now: "Lire maintenant",
    },
    filters: {
      label: "Filtres",
      platform: "Plateforme",
      date: "Date",
      duration: "Durée",
      all_dates: "Toutes les dates",
      all_durations: "Toutes les durées",
      dates: {
        today: "Aujourd'hui",
        weekly: "Cette semaine",
        monthly: "30 derniers jours",
        yearly: "365 derniers jours",
        older: "Plus ancien",
      },
      durations: {
        less_than_10_minutes: "< 10 minutes",
        between_10_30_minutes: "Entre 10 et 30 minutes",
        between_30_60_minutes: "Entre 30 et 60 minutes",
        greater_than_1_hour: "> 60 minutes",
      },
    },
  },

  search: {
    title: "Recherche",
    placeholder: "Rechercher une vidéo ou une chaîne…",
    failed: "La recherche a échoué. Réessayez dans un instant.",
    min_chars: "Tapez au moins {count} caractères pour lancer la recherche.",
    no_results: "Aucun résultat pour « {query} ».",
    views: "{count} vues",
    subscribers: "{count} abonné | {count} abonné | {count} abonnés",
    filters: {
      type: "Type de résultat",
      duration: "Durée",
      sort: "Tri",
    },
    types: {
      all: "Tout",
      videos: "Vidéos",
      channels: "Chaînes",
    },
    durations: {
      any: "Toutes durées",
      short: "< 4 min",
      medium: "4–20 min",
      long: "> 20 min",
    },
    sorts: {
      relevance: "Pertinence",
      recent: "Récentes",
      views: "Populaires",
    },
  },
} satisfies typeof en;
