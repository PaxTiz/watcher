// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  future: {
    compatibilityVersion: 5,
  },

  experimental: {
    nitroAutoImports: true,
  },

  typescript: {
    strict: true,
  },

  devtools: { enabled: true },

  components: [{ path: "~/components", pathPrefix: false }],

  watcherUi: {
    css: ["~/assets/css/app.css"],
  },

  app: {
    head: {
      titleTemplate: "%s - Watcher",
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/images/favicon.svg",
        },
      ],
    },
  },

  modules: ["@nuxt/fonts", "@nuxtjs/color-mode", "@nuxtjs/i18n", "@watcher/ui", "@nuxtjs/seo"],

  site: {
    url: "https://watcher.app",
    name: "Watcher",
    description:
      "Watcher brings your Twitch and YouTube subscriptions together in one place. No more juggling between platforms to avoid missing anything.",
    defaultLocale: "en",
  },

  sitemap: {
    enabled: false,
  },

  ogImage: {
    enabled: false,
  },

  schemaOrg: {
    identity: {
      "@type": "Organization",
      name: "Watcher",
      url: "https://watcher.app",
      logo: "https://watcher.app/images/favicon.svg",
    },
  },

  colorMode: {
    preference: "system",
    fallback: "dark",
    classSuffix: "",
  },

  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", file: "en.ts" },
      { code: "fr", language: "fr-FR", name: "Français", file: "fr.ts" },
      { code: "es", language: "es-ES", name: "Español", file: "es.ts" },
    ],
    defaultLocale: "en",
    langDir: ".",
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "watcher_locale",
      fallbackLocale: "en",
      redirectOn: "no prefix",
    },
  },
});
