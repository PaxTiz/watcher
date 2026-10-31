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
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "nuxt-auth-utils",
    "@watcher/i18n",
    "@watcher/ui",
  ],

  colorMode: {
    preference: "dark",
    fallback: "dark",
    classSuffix: "",
  },

  auth: {
    webAuthn: true,
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
        "@videojs/html/i18n",
        "@videojs/html/video/player",
        "@videojs/html/video/skin",
        "@videojs/html/media/hlsjs-video",
        "@videojs/html/media/youtube-video",
        "vue-sonner",
        "zod/mini",
      ],
    },
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) =>
        ["media-i18n", "video-player", "video-skin", "hlsjs-video", "youtube-video"].includes(tag),
    },
  },

  nitro: {
    // Server code imports everything explicitly (`nuxt/server`, `nitropack/runtime`,
    // `#framework/auth` for nuxt-auth-utils, `#server/...`): nothing is injected implicitly
    imports: {
      autoImport: false,

      // Only reachable through `#imports`: `@nuxtjs/i18n` (10.6.0) still imports it from there in
      // its shared runtime, and Nitro no longer provides it with `nitroAutoImports: false`
      imports: [{ name: "useRuntimeConfig", from: "nitropack/runtime" }],
    },

    experimental: {
      tasks: true,
    },

    scheduledTasks: {
      "0 * * * *": ["database:purge"],
    },

    storage: {
      oauth_tokens: { driver: "lru-cache" },
    },
  },

  runtimeConfig: {
    public: {
      environment: "local", // 'local' | 'production'
    },

    siteUrl: "",

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
    },
  },
});
