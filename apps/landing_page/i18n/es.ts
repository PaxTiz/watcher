import type en from "./en";

export default {
  a11y: {
    skipToContent: "Ir al contenido",
  },

  page: {
    home: "Inicio",
  },

  nav: {
    features: "Funciones",
    overview: "Resumen",
    faq: "FAQ",
    login: "Iniciar sesión",
    openMenu: "Abrir el menú",
  },

  theme: {
    label: "Tema",
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
  },

  language: {
    label: "Idioma",
    fr: "Français",
    en: "English",
    es: "Español",
  },

  hero: {
    live: "En directo",
    titleTemplate: "Encuentra a todos tus {creators} reunidos en un solo {feed}",
    titleCreators: "creadores favoritos",
    titleFeed: "feed unificado",
    subtitle:
      "Watcher reúne tus suscripciones de Twitch y YouTube en una sola interfaz. No más saltar entre plataformas para no perderte nada.",
    ctaStart: "Empezar",
    ctaDemo: "Ver la demo",
  },

  channelsOverview: {
    title: "Todas tus suscripciones en un solo lugar",
    description:
      "Watcher reúne todos los vídeos de YouTube y Twitch de tus creadores favoritos en un único feed unificado.",
    live: "EN VIVO",
    videos: {
      todaySession: "Sesión ranked",
      todayBestMoments: "Mejores momentos #12",
      todayJustChatting: "Just chatting",
      todayFullVod: "VOD completo",
      todaySpeedrun: "Speedrun%",
      yesterdayLetsPlay: "Let's play ep.4",
      yesterdayEveningDraft: "Draft de la tarde",
      yesterdayReactionClip: "Reacción — clip",
      yesterdaySundayCoop: "Co-op del domingo",
      yesterdayWeeklyRecap: "Resumen semanal",
    },
  },

  mainFeatures: {
    title: "Hecho para seguir, no para buscar",
    description: "Cuatro ideas simples pensadas para ahorrarte tiempo cada día.",
    unifiedFeed: {
      title: "Feed unificado",
      description:
        "Vídeos, directos y VOD de Twitch y YouTube reunidos en una sola línea de tiempo, ordenada por fecha.",
    },
    simpleInterface: {
      title: "Interfaz simple",
      description: "Sin sobrecarga, sin ajustes complicados. Abres la app y ves lo nuevo.",
    },
    integratedPlayer: {
      title: "Reproductor integrado",
      description: "Mira directamente en Watcher, sin cambiar de pestaña.",
    },
    channelGrouping: {
      title: "Agrupación de canales",
      description: "Fusiona los canales de Twitch y YouTube de un mismo creador — ver más abajo ↓",
    },
  },

  channelsGrouping: {
    title: "Una sola entidad, varios canales",
    description:
      "Muchos creadores transmiten en directo en Twitch y publican sus repeticiones en un canal de YouTube dedicado. Con Watcher, agrupas estos canales en una sola entidad: sin duplicados, sin confusión, solo el creador correcto.",
    bullets: {
      groupAny: "Agrupa tantos canales como quieras por creador",
      oneFeed: "Un solo feed, una sola notificación, un solo perfil",
      idealForStreamers: "Ideal para streamers de Twitch con canal de repeticiones en YouTube",
    },
    liveStatus: "en directo",
    replaysLabel: "Repeticiones",
    mergeLabel: "FUSIÓN",
    mergedSummary: "1 entidad · 2 canales",
  },

  platformViewer: {
    title: "Tu lista de creadores, por fin legible",
    description:
      "Un panel lateral con todos tus canales, una insignia para los directos en curso y una vista previa del vídeo al pasar el cursor. Nunca más te perderás un estreno.",
    screenshotAlt: "captura de pantalla — panel de creadores",
    liveBadge: "Insignia «en directo» en tiempo real",
    filters: "Filtros por plataforma o creador",
    sync: "Sincronización automática",
  },

  faq: {
    title: "Preguntas frecuentes",
    items: {
      isAppFree: {
        label: "¿La app es gratuita?",
        content:
          "Sí, Watcher es gratis para empezar. Más adelante llegará una oferta premium sin publicidad y con filtros avanzados.",
      },
      howSyncWorks: {
        label: "¿Cómo funciona la sincronización?",
        content:
          "Conectas tus cuentas de Twitch y YouTube en unos clics, y Watcher obtiene automáticamente tus suscripciones y las actualiza de forma continua.",
      },
      areCredentialsSafe: {
        label: "¿Mis credenciales están seguras?",
        content:
          "Watcher solo utiliza las conexiones oficiales de Twitch y YouTube (OAuth) — nunca almacenamos tu contraseña.",
      },
      platformAccess: {
        label: "¿Cuándo tendré acceso a la beta?",
        content:
          "Las invitaciones se envían por oleadas cada semana. Cuanto antes te registres, antes recibirás tu acceso.",
      },
    },
  },

  error: {
    notFound: {
      title: "Página no encontrada",
      description: "La página que buscas no existe o ha sido movida.",
    },
    generic: {
      title: "Ha ocurrido un error",
      description: "Se ha producido un error inesperado. Inténtalo de nuevo.",
    },
    backHome: "Volver al inicio",
  },

  footer: {
    title: "Únete a la beta y simplifica tu seguimiento hoy mismo",
    description: "Conecta una cuenta, prueba Watcher gratis, sin compromiso.",
    ctaTwitch: "Continuar con Twitch",
    ctaYoutube: "Continuar con YouTube",
    copyright: "© 2026 Watcher. No afiliado a Twitch Interactive ni a YouTube LLC.",
    privacy: "Privacidad",
    terms: "Condiciones",
    contact: "Contacto",
  },
} satisfies typeof en;
