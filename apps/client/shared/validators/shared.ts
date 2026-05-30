import { z } from "zod/mini";

export const blueskyHandleSchema = z
  .string({ error: "Le champ est obligatoire" })
  .check(
    z.regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
      { error: "Le format de l'identifiant semble invalide" },
    ),
  );

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
