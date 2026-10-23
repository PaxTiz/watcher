import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework/client";

// Messages are translation keys, resolved by `WatcherFormField`
const nameSchema = z
  .string({ error: "validation.required" })
  .check(
    z.trim(),
    z.minLength(1, { error: "validation.required" }),
    z.maxLength(64, { error: "validation.name_too_long" }),
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
