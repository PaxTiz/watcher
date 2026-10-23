import type en from "./en";

export default {
  a11y: {
    skip_to_content: "Ir al contenido",
  },

  page: {
    home: "Inicio",
  },

  nav: {
    feed: "El feed",
    player: "El reproductor",
    how: "Cómo funciona",
    faq: "FAQ",
    login: "Iniciar sesión",
    start: "Empezar",
  },

  hero: {
    title: "Todos tus canales",
    title_soft: "Un solo lugar",
    lead: "Watcher reúne tus suscripciones de YouTube y Twitch en un solo feed, en el orden en que salen los vídeos. Sin algoritmo.",
    cta_start: "Empezar gratis",
    cta_how: "Ver cómo funciona",
    note: "Gratis · Acceso de solo lectura a tus suscripciones",
  },

  showcase: {
    label: "Vista previa de la aplicación Watcher",
    search: "Buscar",
    home: "Inicio",
    videos: "Vídeos",
    favorites: "Favoritos",
    subscriptions: "Suscripciones",
    greeting: "Hola Alex",
    resume: "Seguir viendo",
    resume_action: "Reanudar",
    remaining: "Quedan 12 min",
    latest: "Novedades",
    search_capsule: "Buscar en tus canales",
  },

  videos: {
    gps: "Tres días sin GPS",
    ranked: "Partida ranked, a por el top 500",
    gameboy: "Desmontamos una Game Boy",
    final: "VOD: la gran final del torneo",
    bread: "El pan del domingo, por fin",
    trains: "Por qué los trenes llegan tarde",
    hooks: {
      gps: "SIN GPS",
      gameboy: "LO HICIMOS",
      bread: "¡POR FIN!",
      trains: "EL PRECIO REAL",
    },
    tags: {
      new: "Nuevo",
      live: "En directo",
      vod: "VOD",
    },
  },

  feed: {
    title: "Un solo feed",
    title_soft: "En el orden en que sale",
    lead: "Los vídeos y directos de todos tus canales, de YouTube y Twitch por igual. Lo más reciente arriba, nada más.",
    today: "Hoy",
  },

  player: {
    title: "Míralo aquí",
    title_soft: "Sigue donde lo dejaste",
    lead: "El reproductor está integrado. Watcher recuerda por dónde vas en cada vídeo y pasa al siguiente cuando quieras.",
    resumed_at: "Reanudado en {time}",
    up_next: "A continuación",
    autoplay: "Reproducción automática",
    next: "Siguiente",
  },

  favorites: {
    title: "Primero tus favoritos",
    title_soft: "El resto cuando quieras",
    lead: "Fija los canales que no quieres perderte. Oculta los que llenan tu feed, sin cancelar la suscripción.",
    favorites: "Favoritos",
    subscriptions: "Suscripciones",
    hidden: "Oculto",
  },

  how: {
    title: "Listo en un minuto",
    title_soft: "Sin contraseña que crear",
    connect: {
      title: "Conecta tu cuenta",
      text: "Google para YouTube, Twitch, o ambos. Watcher solo pide acceso de lectura.",
    },
    import: {
      title: "Llegan tus suscripciones",
      text: "Watcher importa tus canales y sus últimos vídeos, y después sigue los nuevos.",
    },
    watch: {
      title: "Tú miras",
      text: "Un feed, un reproductor, tus favoritos. Puedes desconectarlo todo cuando quieras.",
    },
  },

  faq: {
    title: "Preguntas",
    title_soft: "frecuentes",
    items: {
      free: {
        question: "¿Watcher es gratis?",
        answer:
          "Sí. Puede que más adelante llegue una opción premium, sin quitar nada a la versión gratuita.",
      },
      platforms: {
        question: "¿Qué plataformas?",
        answer: "YouTube y Twitch. Puedes conectar una, la otra o ambas.",
      },
      access: {
        question: "¿Qué puede hacer Watcher en mis cuentas?",
        answer:
          "Nada más que leer tu lista de suscripciones. Nunca publica nada y nunca ve tu contraseña.",
      },
      mobile: {
        question: "¿Funciona en el móvil?",
        answer: "Sí, directamente en el navegador de tu teléfono.",
      },
    },
  },

  final: {
    title: "Tus canales te esperan",
    title_soft: "Solo faltas tú",
    google: "Continuar con Google",
    twitch: "Continuar con Twitch",
    note: "Gratis · Solo lectura · Borra tu cuenta cuando quieras",
  },

  error: {
    not_found: {
      title: "Página no encontrada",
      description: "La página que buscas no existe o se ha movido.",
    },
    generic: {
      title: "Algo ha salido mal",
      description: "Se ha producido un error inesperado. Inténtalo de nuevo.",
    },
    back_home: "Volver al inicio",
  },

  footer: {
    copyright: "© 2026 Watcher. Sin afiliación con YouTube ni Twitch.",
    privacy: "Privacidad",
    terms: "Condiciones",
    contact: "Contacto",
  },
} satisfies typeof en;
