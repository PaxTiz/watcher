import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  // typescript: {
  //   strict: true,
  //   typeCheck: true,
  // },

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
    // @ts-expect-error
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    database: {
      host: "",
      port: "",
      user: "",
      pass: "",
      name: "",
    },

    google: {
      clientId: "",
      clientSecret: "",
    },

    twitch: {
      playerClientId: "",
      clientId: "",
      clientSecret: "",
    },

    atproto: {
      clientId: "",
      clientSecret: "",
    },
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) =>
        [
          "media-controller",
          "hls-video",
          "youtube-video",
          "media-loading-indicator",
          "media-control-bar",
          "media-play-button",
          "media-seek-backward-button",
          "media-seek-forward-button",
          "media-mute-button",
          "media-volume-range",
          "media-time-range",
          "media-time-display",
          "media-playback-rate-button",
          "media-fullscreen-button",
        ].includes(tag),
    },
  },
});
