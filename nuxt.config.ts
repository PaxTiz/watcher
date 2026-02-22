import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  components: [{ path: "~/components", pathPrefix: false }],

  css: ["~/assets/css/app.css"],

  modules: ["@nuxt/fonts", "@nuxt/icon", "@nuxt/scripts", "@vueuse/nuxt"],

  fonts: {
    provider: "bunny",

    defaults: {
      weights: [400, 500, 600, 700],
      styles: ["normal"],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
