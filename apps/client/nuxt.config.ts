import { join } from "node:path";

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

  modules: [
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "nuxt-auth-utils",
    "@watcher/ui",
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

  vite: {
    optimizeDeps: {
      include: [
        "reka-ui",
        "date-fns",
        "date-fns/locale",
        "hls.js",
        "plyr",
        "vue-sonner",
        "zod/mini",
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

    encryption: {
      credentials: {
        access_token: "",
        refresh_token: "",
      },
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
