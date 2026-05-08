import { z } from "zod/mini";

export const blueskyHandleSchema = z
  .string({ error: "Le champ est obligatoire" })
  .check(
    z.regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
      { error: "Le format du handle semble invalide" },
    ),
  );
