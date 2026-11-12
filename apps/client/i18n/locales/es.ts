import type en from "./en";

export default {
  meta: {
    description: "Watcher - Sigue a todos tus creadores favoritos en un solo lugar",
  },

  nav: {
    label: "Navegación principal",
    breadcrumb: "Ruta de navegación",
    home: "Inicio",
    videos: "Vídeos",
    favorites: "Favoritos",
    my_favorites: "Mis favoritos",
    subscriptions: "Suscripciones",
    channels: "Canales",
    settings: "Ajustes",
    open_menu: "Abrir el menú",
    back: "Volver",
    expand: "Desplegar",
    collapse: "Plegar",
    expand_sidebar: "Desplegar la barra lateral",
    collapse_sidebar: "Plegar la barra lateral",
  },

  account: {
    label: "Cuenta",
    label_of: "Cuenta de {name}",
    logout: "Cerrar sesión",
  },

  sync: {
    action: "Sincronizar",
    running: "Sincronizando…",
    done: "Sincronización completada",
    failed: "La sincronización ha fallado, inténtalo de nuevo en unos minutos",
    in_progress: "Ya hay una sincronización en curso",
  },

  errors: {
    generic: "Se ha producido un error, inténtalo de nuevo en unos instantes",
    internal: "Se ha producido un error interno",
    too_many_attempts: "Demasiados intentos, inténtalo de nuevo {delay}",
    too_many_attempts_later: "Demasiados intentos, inténtalo de nuevo más tarde",
  },

  validation: {
    name_too_long: "El nombre no debe superar los 64 caracteres",
  },

  auth: {
    title: "Iniciar sesión",
    headline: "Todos tus canales, en un solo lugar.",
    benefits: {
      feed: "Tus suscripciones de YouTube y Twitch reunidas en un solo feed",
      order: "En el orden en que salen, sin ningún algoritmo que ordene por ti",
      resume: "Retoma cada vídeo justo donde lo dejaste",
    },
    google: "Continuar con Google",
    passkey: "Llave de acceso",
    read_only: "Acceso de solo lectura a tus suscripciones de YouTube y Twitch.",
    preview: {
      title: "Un solo feed",
      text: "todos tus canales, en el orden en que salen",
    },
  },

  passkeys: {
    title: "Llaves de acceso",
    description: "Inicia sesión con la huella, la cara o el código de tu dispositivo.",
    name: "Nombre de la llave de acceso",
    name_placeholder: "MacBook, iPhone, Bitwarden…",
    name_hint:
      "Ponle un nombre para reconocerla fácilmente, por ejemplo el dispositivo o el gestor de contraseñas que la guarda.",
    added_on: "Añadida el {date}",
    used_ago: "Usada {ago}",
    add: {
      title: "Añadir una llave de acceso",
      supported: "Guarda una llave de acceso en este dispositivo.",
      unsupported: "Tu navegador no admite las llaves de acceso.",
      success: "Tu llave de acceso se ha añadido",
    },
    rename: {
      title: "Renombrar la llave de acceso",
      success: "La llave de acceso se ha renombrado",
      failed: "No se ha podido renombrar la llave de acceso, inténtalo más tarde",
    },
    delete: {
      title: "Eliminar esta llave de acceso",
      description:
        "Ya no podrás iniciar sesión en Watcher con esta llave de acceso. Recuerda eliminarla también de tu dispositivo o de tu gestor de contraseñas.",
      success: "La llave de acceso se ha eliminado",
      failed: "No se ha podido eliminar la llave de acceso, inténtalo más tarde",
      last_login_method: "Vincula una cuenta u otra llave de acceso antes de eliminar esta",
    },
    errors: {
      already_registered: "Esta llave de acceso ya está vinculada a tu cuenta",
      unknown: "Esta llave de acceso no está vinculada a ninguna cuenta de Watcher",
      expired: "La solicitud ha caducado, inténtalo de nuevo",
      user_verification_required:
        "Tu dispositivo debe confirmar tu identidad (PIN, huella o rostro)",
      login: "Se ha producido un error al iniciar sesión con tu llave de acceso",
      add: "Se ha producido un error al añadir tu llave de acceso",
      wrong_account: "Esta llave de acceso pertenece a otra cuenta de Watcher",
    },
  },

  reauthentication: {
    title: "Confirma tu identidad",
    description: "Esta acción es sensible: confirma que eres tú antes de continuar.",
    passkey: "Usar una llave de acceso",
    integration: "Continuar con {name}",
    failed: "No se ha podido verificar tu identidad, inténtalo más tarde",
  },

  sessions: {
    title: "Sesiones activas",
    description:
      "Los dispositivos conectados a tu cuenta. Cierra la sesión de los que no reconozcas.",
    current: "Este dispositivo",
    active_ago: "Activo {ago}",
    signed_in_with: "Conectado con {method}",
    passkey: "una llave de acceso",
    unknown_device: "Dispositivo desconocido",
    revoke: {
      action: "Cerrar sesión",
      title: "Cerrar la sesión de este dispositivo",
      description: "Este dispositivo tendrá que volver a iniciar sesión para acceder a tu cuenta.",
      success: "Se ha cerrado la sesión del dispositivo",
      failed: "No se ha podido cerrar la sesión del dispositivo, inténtalo más tarde",
    },
    revoke_others: {
      title: "Cerrar la sesión de los demás dispositivos",
      hint: "Solo este dispositivo seguirá conectado.",
      description:
        "Los demás dispositivos tendrán que volver a iniciar sesión para acceder a tu cuenta.",
      success: "Se ha cerrado la sesión de los demás dispositivos",
      failed: "No se ha podido cerrar la sesión de los demás dispositivos, inténtalo más tarde",
    },
  },

  dashboard: {
    description: "Descubre las últimas novedades de tus creadores favoritos.",
    greeting: "Hola {name}",
    synced_ago: "Sincronizado {ago}",
    resume: "Seguir viendo",
    resume_action: "Reanudar",
    mark_as_watched: "Marcar como visto",
    also_in_progress: "También en curso",
    favorites: "Novedades de tus favoritos",
    empty: {
      title: "No hay vídeos que mostrar.",
      description: "Lanza una sincronización para obtener contenido.",
    },
    loading_more: "Cargando más vídeos…",
    groups: {
      today: "Hoy",
      yesterday: "Ayer",
      weekly: "Últimos 7 días",
      monthly: "Últimos 30 días",
      older: "Más antiguos",
    },
  },

  onboarding: {
    title: "Bienvenida",
    description: "Configura tus accesos y sincroniza tus suscripciones fácilmente",
    heading: "Te damos la bienvenida a Watcher",
    lead: "Vincula tus cuentas y lanza una primera sincronización para obtener tus canales y sus últimos vídeos.",
    link: {
      title: "Vincula tus cuentas",
      description: "Conecta las plataformas que quieras para reunir todas tus suscripciones.",
    },
    sync: {
      title: "Sincroniza tus suscripciones",
      description:
        "Watcher obtiene tus suscripciones de las cuentas vinculadas e importa sus últimos vídeos.",
      action: "Sincronizar mis suscripciones",
      later: "Más tarde",
      stay: "Quédate en esta página, se te redirigirá automáticamente.",
    },
  },

  integrations: {
    linked: "Conectado",
    unlinked: "No conectado",
    link: "Vincular",
    disconnect: {
      action: "Desconectar",
      title: "Desconectar tu cuenta de {name}",
      description:
        "Si desconectas tu cuenta, tus suscripciones y sus vídeos dejarán de actualizarse.",
      success: "Tu cuenta de {name} se ha desconectado",
      failed: "Se ha producido un error al desconectar {name}",
      last_login_method:
        "Vincula otra cuenta o añade una llave de acceso antes de desconectar {name}",
    },
    oauth: {
      success: "Tu cuenta de {provider} ya está conectada",
      already_linked: "Esta cuenta de {provider} ya está vinculada a otra cuenta de Watcher.",
      link_not_requested:
        "Conecta {provider} desde la página de ajustes para vincularlo a tu cuenta.",
      reauthenticated: "Identidad confirmada, ya puedes repetir tu acción",
      reauthentication_required: "Confirma primero tu identidad desde la página de ajustes",
      wrong_account: "Esta cuenta de {provider} no es la vinculada a tu cuenta de Watcher",
      failed: "Se ha producido un error al conectar tu cuenta de {provider}",
    },
  },

  settings: {
    heading: "Mi cuenta",
    linked_accounts: {
      title: "Cuentas vinculadas",
      description: "Tus suscripciones de YouTube y Twitch se obtienen de estas cuentas.",
    },
    interface: "Interfaz",
    account: "Cuenta",
    danger: "Zona de peligro",
    delete_account: {
      title: "Eliminar mi cuenta",
      description: "Elimina definitivamente tu cuenta, tus suscripciones y tu historial.",
      confirm:
        "Tu cuenta, tus suscripciones y tu historial se eliminarán definitivamente. Esta acción no se puede deshacer.",
      success: "Tu cuenta se ha eliminado",
      failed: "No se ha podido eliminar tu cuenta, inténtalo más tarde",
    },
  },

  subscriptions: {
    filter: "Filtrar {count} suscripciones",
    filter_label: "Filtrar las suscripciones",
    filter_by_service: "Filtrar por servicio",
    all_services: "Todos los servicios",
    hidden: "Oculto",
    new_video: "Nuevo vídeo en las últimas 24 horas",
    empty: "No se ha encontrado ninguna suscripción.",
    logo: "Logo de {name}",
    discover: "Descubre los últimos vídeos de {name}.",
    last_video: "Último vídeo {ago}",
    open_on: "Abrir en {service}",
    open_new_tab: "Abrir en una pestaña nueva",
    search_in: "Buscar en {name}",
    search_in_label: "Buscar en los vídeos de {name}",
    favorite: {
      add: "Añadir a favoritos",
      remove: "Quitar de favoritos",
      active: "En favoritos",
      added: "{name} se ha añadido a tus favoritos",
      removed: "{name} se ha quitado de tus favoritos",
      failed: "No se han podido modificar tus favoritos, inténtalo más tarde",
    },
    hide: {
      action: "Ocultar",
      show: "Volver a mostrar",
      title: "Ocultar el canal",
      description:
        "Los vídeos de {name} dejarán de aparecer en tu feed. Podrás volver a mostrarlo desde esta página.",
      notice:
        "Este canal está oculto: sus vídeos ya no son accesibles. Vuelve a mostrarlo para recuperarlos.",
      failed: "No se ha podido modificar el canal, inténtalo más tarde",
    },
  },

  videos: {
    description: "Explora todos los vídeos de tus suscripciones de YouTube y Twitch.",
    favorites_title: "Vídeos de tus favoritos",
    results_for: "Resultados para «{query}»",
    count: "{n} vídeos | {n} vídeo | {n} vídeos",
    no_results: "Lo sentimos, no se ha encontrado ningún resultado para tu búsqueda.",
    watched: "Visto",
    new: "Nuevo",
    hidden: "Oculto",
    actions: "Acciones del vídeo",
    video: "Vídeo",
    subscription: "Suscripción",
    published: "Publicado {ago} · {date}",
    watch_description: "Mira el vídeo {title} de {author}, publicado el {date}.",
    mark_as_watched: {
      action: "Marcar como visto",
      success: "El vídeo se ha marcado como visto",
      failed: "No se ha podido marcar el vídeo como visto, inténtalo más tarde",
    },
    hide: {
      action: "Ocultar el vídeo",
      title: "Ocultar un vídeo",
      description: "¿Seguro que quieres ocultar este vídeo? Dejará de aparecer en tu feed.",
      hidden: "Vídeo oculto",
      hidden_description: "Dejará de aparecer en tu feed.",
      success: "El vídeo se ha ocultado",
      failed: "No se ha podido ocultar el vídeo, inténtalo más tarde",
    },
    show: {
      action: "Volver a mostrar el vídeo",
      success: "El vídeo vuelve a estar visible",
      failed: "No se pudo volver a mostrar el vídeo, inténtalo más tarde",
    },
    hide_channel: {
      action: "Ocultar el canal",
      title: "Ocultar un canal",
      description:
        "¿Seguro que quieres ocultar este canal? Su historial y los nuevos vídeos que publique dejarán de verse en tu feed.",
      hidden: "Canal oculto",
      hidden_description: "Sus vídeos dejarán de aparecer en tu feed.",
      success: "El canal se ha ocultado",
      failed: "No se ha podido ocultar el canal, inténtalo más tarde",
    },
    favorite: {
      added: "La suscripción se ha añadido a tus favoritos",
      removed: "La suscripción se ha quitado de tus favoritos",
    },
    theater: {
      enter: "Modo cine",
      exit: "Salir del modo cine",
    },
    up_next: {
      title: "A continuación",
      autoplay: "Reproducción automática",
      next: "Siguiente",
      empty: "Por ahora no hay más vídeos de este canal.",
    },
    countdown: {
      label: "Siguiente vídeo",
      remaining: "Siguiente vídeo en {seconds} s",
      play_now: "Reproducir ahora",
    },
    filters: {
      label: "Filtros",
      platform: "Plataforma",
      date: "Fecha",
      duration: "Duración",
      all_dates: "Todas las fechas",
      all_durations: "Todas las duraciones",
      with_hidden: "Contenido oculto",
      with_watched: "Ya vistos",
      dates: {
        today: "Hoy",
        weekly: "Últimos 7 días",
        monthly: "Últimos 30 días",
        yearly: "Últimos 365 días",
        older: "Más antiguos",
      },
      durations: {
        less_than_10_minutes: "< 10 minutos",
        between_10_30_minutes: "Entre 10 y 30 minutos",
        between_30_60_minutes: "Entre 30 y 60 minutos",
        greater_than_1_hour: "> 60 minutos",
      },
    },
  },

  shortcuts: {
    title: "Atajos de teclado",
    close: "Cerrar",
    space: "Espacio",
    groups: {
      general: "General",
      navigation: "Navegación",
      video: "Vídeo",
    },
    actions: {
      search: "Buscar",
      toggle_sidebar: "Contraer o expandir la barra lateral",
      help: "Mostrar los atajos de teclado",
      videos: "Ir a los vídeos",
      favorites: "Ir a favoritos",
      theater: "Modo cine",
    },
    player: {
      play: "Reproducir / pausar",
      fullscreen: "Pantalla completa",
      mute: "Silenciar",
      seek: "Retroceder / avanzar 10 s",
      volume: "Bajar / subir el volumen",
      captions: "Subtítulos",
      pip: "Picture-in-picture",
      jump: "Ir al 0 % – 90 % del vídeo",
    },
  },

  search: {
    title: "Búsqueda",
    placeholder: "Busca un vídeo o un canal…",
    failed: "La búsqueda ha fallado. Inténtalo de nuevo en un momento.",
    min_chars: "Escribe al menos {count} caracteres para buscar.",
    no_results: "No hay resultados para «{query}».",
    filters: {
      type: "Tipo de resultado",
      duration: "Duración",
      sort: "Orden",
      guests: "Invitados",
    },
    types: {
      all: "Todo",
      videos: "Vídeos",
      channels: "Canales",
    },
    durations: {
      any: "Cualquier duración",
      less_than_10_minutes: "< 10 min",
      between_10_30_minutes: "10–30 min",
      between_30_60_minutes: "30–60 min",
      greater_than_1_hour: "> 1 h",
    },
    sorts: {
      relevance: "Relevancia",
      recent: "Recientes",
    },
  },
} satisfies typeof en;
