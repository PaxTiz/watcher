import { join } from "node:path";

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

  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/images/favicon.svg",
        },
      ],
    },
  },

  modules: ["@nuxt/fonts", "@nuxt/icon", "@nuxt/image", "@vueuse/nuxt"],

  image: {
    provider: "ipx",
    ipx: {
      baseURL: "/uploads",
      fs: {
        dir: join(process.cwd(), ".storage", "uploads"),
        maxAge: 3600 * 12, // 12 hours
      },
    },
  },

  fonts: {
    provider: "bunny",

    defaults: {
      weights: [400, 500, 600, 700],
      styles: ["normal"],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["embla-carousel-vue", "vue-tippy", "date-fns", "date-fns/locale", "hls.js", "plyr"],
    },
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
});
