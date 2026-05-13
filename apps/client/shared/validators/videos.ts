import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework/client";

export const videosValidatorsSchema = defineValidator({
  find: {
    params: z.object({
      id: z.uuidv7(),
    }),
  },

  list: {
    query: z.object({
      page: z.coerce.number().check(z.gte(1)),
      service: z.optional(z.enum(["youtube", "twitch"])),
      duration: z.optional(
        z.enum([
          "less_than_10_minutes",
          "between_10_30_minutes",
          "between_30_60_minutes",
          "greater_than_1_hour",
        ]),
      ),
      date: z.optional(z.enum(["today", "weekly", "monthly", "yearly", "older"])),
      subscription_id: z.optional(z.uuidv7()),
    }),
  },

  url: {
    params: z.object({
      id: z.uuidv7(),
    }),
  },

  segment: {
    query: z.object({
      base_url: z.string(),
    }),
    params: z.object({
      id: z.uuidv7(),
      path: z.string(),
      quality: z.string(),
    }),
  },
});

export type VideosValidators = InferValidators<typeof videosValidatorsSchema>;
