import tailwindcss from "@tailwindcss/vite";
import {
  addComponentsDir,
  addImportsDir,
  addTemplate,
  addTypeTemplate,
  addVitePlugin,
  createResolver,
  defineNuxtModule,
  resolvePath,
} from "nuxt/kit";

export interface ModuleOptions {
  /**
   * Extra CSS files (app-relative, e.g. "~/assets/css/app.css") to merge into
   * the same Tailwind build graph as the Watcher UI tokens. Because they share
   * the same `@import "tailwindcss"` root, consuming apps can use `@theme`,
   * `@utility` and `@source` to extend the design system, on top of plain CSS
   * overrides, and have them actually processed by Tailwind.
   */
  css?: string[];
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@watcher/ui",
    configKey: "watcherUi",
  },

  defaults: {
    css: [],
  },

  moduleDependencies: {
    "reka-ui/nuxt": {},
    "@vueuse/nuxt": {},
    // "@nuxt/icon": {},
    "@nuxt/fonts": {
      defaults: {
        provider: "bunny",

        defaults: {
          weights: [400, 500, 600, 700, 800, 900],
          styles: ["normal"],
        },
      },
    },
  },

  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Watcher",
      pathPrefix: false,
    });

    addImportsDir(resolver.resolve("./runtime/composables"));

    addVitePlugin(() => tailwindcss());

    const cssPath = resolver.resolve("./runtime/css/app.css");
    const extraCssPaths = await Promise.all((options.css ?? []).map((path) => resolvePath(path)));

    const entry = addTemplate({
      filename: "watcher-ui/app.css",
      write: true,
      getContents: () =>
        [cssPath, ...extraCssPaths].map((path) => `@import ${JSON.stringify(path)};`).join("\n"),
    });

    nuxt.options.css.unshift(entry.dst);

    addTypeTemplate({
      filename: "types/watcher-ui.d.ts",
      getContents: () => `declare module "@watcher/ui" {
  export type { AccordionItem } from ${JSON.stringify(resolver.resolve("./runtime/types/accordion"))};
  export type { DropdownItem } from ${JSON.stringify(resolver.resolve("./runtime/types/dropdown"))};
  export type { FormSubmitEvent } from ${JSON.stringify(resolver.resolve("./runtime/types/forms"))};
}
`,
    });
  },
});
