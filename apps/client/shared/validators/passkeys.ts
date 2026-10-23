import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework/client";

const nameSchema = z
  .string({ error: "Le champ est obligatoire" })
  .check(
    z.trim(),
    z.minLength(1, { error: "Le champ est obligatoire" }),
    z.maxLength(64, { error: "Le nom ne doit pas dépasser 64 caractères" }),
  );

export const passkeysValidatorsSchema = defineValidator({
  signup: {
    body: z.object({
      name: nameSchema,
      passkey_name: nameSchema,
    }),
  },

  name: {
    body: z.object({
      name: nameSchema,
    }),
  },

  rename: {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: nameSchema,
    }),
  },

  delete: {
    params: z.object({
      id: z.string(),
    }),
  },
});

export type PasskeysValidators = InferValidators<typeof passkeysValidatorsSchema>;
