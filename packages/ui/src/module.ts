import {
  addComponentsDir,
  addImportsDir,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
} from "nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "@watcher/ui",
    configKey: "watcherUi",
  },

  moduleDependencies: {
    "reka-ui/nuxt": {},
  },

  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);

    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Watcher",
      pathPrefix: false,
    });

    addImportsDir(resolver.resolve("./runtime/composables"));

    nuxt.options.css.unshift(resolver.resolve("./runtime/css/tokens.css"));

    addTypeTemplate({
      filename: "types/watcher-ui.d.ts",
      getContents: () => `declare module "@watcher/ui" {
  export type { DropdownItem } from ${JSON.stringify(resolver.resolve("./runtime/types/dropdown"))};
  export type { FormSubmitEvent } from ${JSON.stringify(resolver.resolve("./runtime/types/forms"))};
}
`,
    });
  },
});
