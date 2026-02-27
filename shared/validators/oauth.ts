import { type InferValidators, defineValidator } from "#framework";
import { z } from "zod/mini";

export const oauthValidatorsSchema = defineValidator({
  callback: {
    query: z.object({
      code: z.string(),
      state: z.string(),
    }),
  },
});

export type OAuthValidators = InferValidators<typeof oauthValidatorsSchema>;
