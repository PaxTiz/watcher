import type en from "./en";

export default {
  common: {
    add: "Ajouter",
    all: "Tout",
    cancel: "Annuler",
    confirm: "Confirmer",
    continue: "Continuer",
    delete: "Supprimer",
    rename: "Renommer",
    save: "Enregistrer",
    search: "Rechercher",
    previous: "Précédent",
    next: "Suivant",
    more: "Plus",
    less: "Moins",
    clear: "Effacer",
    see_all: "Tout voir",
  },

  theme: {
    label: "Thème",
    system: "Système",
    light: "Clair",
    dark: "Sombre",
  },

  language: {
    label: "Langue",
  },

  validation: {
    required: "Le champ est obligatoire",
  },

  ui: {
    command_palette: {
      title: "Palette de commandes",
      placeholder: "Rechercher",
      empty: "Aucun résultat",
      escape: "Échap",
      navigate: "Naviguer",
      select: "Sélectionner",
    },
    pagination: {
      label: "Pagination",
      first: "Première page",
      previous: "Page précédente",
      next: "Page suivante",
      last: "Dernière page",
    },
    select: {
      placeholder: "Sélectionner…",
    },
    confirm: {
      title: "Êtes-vous sûr ?",
      description: "Cette action est irréversible. Confirmez que vous souhaitez continuer.",
    },
  },
} satisfies typeof en;
