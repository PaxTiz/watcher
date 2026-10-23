import type en from "./en";

export default {
  common: {
    add: "Añadir",
    all: "Todo",
    cancel: "Cancelar",
    confirm: "Confirmar",
    continue: "Continuar",
    delete: "Eliminar",
    rename: "Renombrar",
    save: "Guardar",
    search: "Buscar",
    previous: "Anterior",
    next: "Siguiente",
    more: "Más",
    less: "Menos",
    clear: "Borrar",
    see_all: "Ver todo",
  },

  theme: {
    label: "Tema",
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
  },

  language: {
    label: "Idioma",
  },

  validation: {
    required: "Este campo es obligatorio",
  },

  ui: {
    command_palette: {
      title: "Paleta de comandos",
      placeholder: "Buscar",
      empty: "Sin resultados",
      escape: "Esc",
      navigate: "Navegar",
      select: "Seleccionar",
    },
    pagination: {
      label: "Paginación",
      first: "Primera página",
      previous: "Página anterior",
      next: "Página siguiente",
      last: "Última página",
    },
    select: {
      placeholder: "Seleccionar…",
    },
    confirm: {
      title: "¿Estás seguro?",
      description: "Esta acción no se puede deshacer. Confirma que quieres continuar.",
    },
  },
} satisfies typeof en;
