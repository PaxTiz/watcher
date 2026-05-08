import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework/client";

export const oauthValidatorsSchema = defineValidator({
  loginWithBluesky: {
    body: z.object({
      handle: z.string(),
    }),
  },

  callback: {
    query: z.object({
      code: z.string(),
      state: z.string(),
    }),
  },
});

export type OAuthValidators = InferValidators<typeof oauthValidatorsSchema>;
