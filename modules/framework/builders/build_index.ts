import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function buildIndex(root: string) {
  const path = join(root, "index.ts");

  await writeFile(
    path,
    `
    export { useLogger } from '../modules/framework/utils/use_logger';

    export { AbstractService, AbstractCacheService } from '../modules/framework/services/define_service';
  `,
  );
}
