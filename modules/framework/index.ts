import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createResolver, defineNuxtModule } from "nuxt/kit";

import { buildIndex } from "./builders/build_index";
import { buildServer } from "./builders/build_server";

export default defineNuxtModule({
  meta: {
    name: "framework",
    configKey: "framework",
  },

  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);

    const rootDir = join(nuxt.options.rootDir, ".framework");
    if (existsSync(rootDir)) {
      rmSync(rootDir, { force: true, recursive: true });
    }
    mkdirSync(rootDir);

    nuxt.options.alias["#framework"] = join(rootDir, "index.ts");
    nuxt.options.alias["#framework/server"] = join(rootDir, "server.ts");

    await buildIndex(rootDir);
    await buildServer(nuxt.options.rootDir, rootDir);
  },
});
