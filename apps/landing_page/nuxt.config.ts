// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  future: {
    compatibilityVersion: 5,
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

  modules: ["@nuxt/fonts", "@nuxtjs/color-mode", "@watcher/i18n", "@watcher/ui", "@nuxtjs/seo"],

  nitro: {
    imports: {
      autoImport: false,

      // Only reachable through `#imports`: `@nuxtjs/i18n` (10.6.0) still imports it from there in
      // its shared runtime, and Nitro no longer provides it with `nitroAutoImports: false`
      imports: [{ name: "useRuntimeConfig", from: "nitropack/runtime" }],
    },
  },

  runtimeConfig: {
    public: {
      appUrl: "http://localhost:3000",
    },
  },

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
    strategy: "prefix_and_default",
  },
});
