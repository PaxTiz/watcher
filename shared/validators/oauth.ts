import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework";

export const oauthValidatorsSchema = defineValidator({
  callback: {
    query: z.object({
      code: z.string(),
      state: z.string(),
    }),
  },
});

export type OAuthValidators = InferValidators<typeof oauthValidatorsSchema>;
