export const LOCALES = [
  { code: "en", language: "en-US", name: "English", flag: "circle-flags:gb" },
  { code: "fr", language: "fr-FR", name: "Français", flag: "circle-flags:fr" },
  { code: "es", language: "es-ES", name: "Español", flag: "circle-flags:es" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";
