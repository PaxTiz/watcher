import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework";

export const videosValidatorsSchema = defineValidator({
  find: {
    params: z.object({
      id: z.coerce.number(),
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
    }),
  },

  url: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },

  segment: {
    query: z.object({
      base_url: z.string(),
    }),
    params: z.object({
      id: z.coerce.number(),
      path: z.string(),
      quality: z.string(),
    }),
  },
});

export type VideosValidators = InferValidators<typeof videosValidatorsSchema>;
