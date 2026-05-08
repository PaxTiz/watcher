import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function buildClient(root: string) {
  const path = join(root, "client.ts");

  await writeFile(
    path,
    `
    export { defineValidator, type InferValidators } from '../modules/framework/validator/define_validator';
  `,
  );
}
