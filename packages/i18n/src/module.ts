import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  addImportsDir,
  addPlugin,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
} from "nuxt/kit";
import type { ModuleDependencies, Nuxt } from "nuxt/schema";

import { DEFAULT_LOCALE, LOCALES } from "./locales.ts";

export { DEFAULT_LOCALE, LOCALES, type LocaleCode } from "./locales.ts";

const toLocaleFiles = () =>
  LOCALES.map(({ code, language, name }) => ({ code, language, name, file: `${code}.ts` }));

export default defineNuxtModule({
  meta: {
    name: "@watcher/i18n",
    configKey: "watcherI18n",
  },

  moduleDependencies: (nuxt: Nuxt): ModuleDependencies => {
    const strategy = nuxt.options.i18n?.strategy ?? "no_prefix";

    return {
      "@nuxtjs/i18n": {
        defaults: {
          defaultLocale: DEFAULT_LOCALE,
          strategy,
          detectBrowserLanguage: {
            useCookie: true,
            cookieKey: "watcher_locale",
            fallbackLocale: DEFAULT_LOCALE,
            // Without prefixes, the locale must be detected on every page, not only on `/`
            redirectOn: strategy === "no_prefix" ? "all" : "root",
          },
        },
      },
    };
  },

  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);

    const appLangDir = join(nuxt.options.rootDir, "i18n", "locales");
    const sharedLangDir = resolver.resolve("./runtime/locales");
    const hasAppMessages = existsSync(appLangDir);

    nuxt.hook("i18n:registerModule", (register) => {
      if (hasAppMessages) {
        register({ langDir: appLangDir, locales: toLocaleFiles() });
      }

      register({ langDir: sharedLangDir, locales: toLocaleFiles() });
    });

    addTypeTemplate({
      filename: "types/watcher-i18n.d.ts",
      getContents: () => {
        const sources = [join(sharedLangDir, DEFAULT_LOCALE)];
        if (hasAppMessages) {
          sources.push(join(appLangDir, DEFAULT_LOCALE));
        }

        return `${sources.map((source, index) => `import type messages_${index} from ${JSON.stringify(source)};`).join("\n")}

type WatcherMessages = ${sources.map((_, index) => `typeof messages_${index}`).join(" & ")};

declare module "vue-i18n" {
  export interface DefineLocaleMessage extends WatcherMessages {}
}

export {};
`;
      },
    });

    addImportsDir(resolver.resolve("./runtime/composables"));

    addPlugin(
      { src: resolver.resolve("./runtime/plugins/html_lang"), mode: "all" },
      { append: true },
    );
  },
});
