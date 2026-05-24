import { join } from "node:path";

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
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "nuxt-auth-utils",
    "reka-ui/nuxt",
  ],

  colorMode: {
    preference: "system",
    fallback: "dark",
    classSuffix: "",
  },

  devServer: {
    // Used with atproto oauth
    // https://atproto.com/specs/oauth#localhost-client-development
    host: "127.0.0.1",
  },

  auth: {
    atproto: true,
  },

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
      include: [
        "embla-carousel-vue",
        "date-fns",
        "date-fns/locale",
        "hls.js",
        "plyr",
        "vue-sonner",
        "zod/mini",
        "@headlessui/vue",
      ],
    },
  },

  runtimeConfig: {
    public: {
      environment: "local", // 'local' | 'production'
    },

    database: {
      host: "",
      port: "",
      user: "",
      pass: "",
      name: "",
    },

    oauth: {
      google: {
        clientId: "",
        clientSecret: "",
      },

      twitch: {
        playerClientId: "",
        clientId: "",
        clientSecret: "",
      },

      bluesky: {
        scope: ["atproto", "transition:generic", "transition:email"],
        clientId: "",
      },
    },
  },
});
