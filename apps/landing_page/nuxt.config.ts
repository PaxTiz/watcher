import tailwindcss from "@tailwindcss/vite";

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

  css: ["~/assets/css/app.css"],

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

  modules: [
    "@nuxt/fonts",
    // "@nuxt/icon",
    "@nuxtjs/color-mode",
    "@watcher/ui",
  ],

  colorMode: {
    preference: "system",
    fallback: "dark",
    classSuffix: "",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
