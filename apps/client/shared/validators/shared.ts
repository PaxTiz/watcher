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

export const queryArraySchema = <T extends z.ZodMiniType<string>>(item: T, max: number) =>
  z
    .pipe(
      z.union([item, z.array(item)]),
      z.transform((value) => (Array.isArray(value) ? value : [value])),
    )
    .check(z.maxLength(max));
