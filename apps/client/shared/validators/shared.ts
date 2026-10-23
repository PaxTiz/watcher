import { z } from "zod/mini";

export const booleanSchema = z.union([
  z.literal(true),
  z.pipe(
    z.literal("true"),
    z.transform((_) => true),
  ),
  z.literal(false),
  z.pipe(
    z.literal("false"),
    z.transform((_) => false),
  ),
]);
