import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

import { buildServicesList } from "../services/builder";

export async function buildServer(nuxtRoot: string, root: string) {
  const path = join(root, "server.ts");

  if (existsSync(path)) {
    rmSync(path);
  }

  await buildServicesList(nuxtRoot, path);
}
