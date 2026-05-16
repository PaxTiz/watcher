import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework/client";

export const integrationsValidatorsSchema = defineValidator({
  disconnect: {
    params: z.object({
      provider: z.enum(["google", "twitch", "bluesky"]),
    }),
  },
});

export type IntegrationsValidators = InferValidators<typeof integrationsValidatorsSchema>;
