import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework/client";

import { booleanSchema } from "./shared";

export const videosValidatorsSchema = defineValidator({
  find: {
    params: z.object({
      id: z.uuidv7(),
    }),
  },

  list: {
    query: z.object({
      page: z.coerce.number().check(z.int(), z.gte(1), z.lte(1000)),
      per_page: z._default(z.coerce.number().check(z.int(), z.gte(1), z.lte(50)), 21),
      before: z.optional(z.uuidv7()),
      with_total: z.optional(booleanSchema),
      query: z.optional(z.string().check(z.maxLength(100))),
      service: z.optional(z.enum(["youtube", "twitch"])),
      is_favorite: z.optional(booleanSchema),
      in_progress: z.optional(booleanSchema),
      with_hidden: z.optional(booleanSchema),
      with_watched: z.optional(booleanSchema),
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
      base_url: z.url({ protocol: /^https$/ }),
      expires: z.coerce.number().check(z.int(), z.positive()),
      signature: z.string().check(z.maxLength(64)),
    }),
    params: z.object({
      id: z.uuidv7(),
      path: z.string().check(z.regex(/^[\w-]+\.(ts|mp4|m3u8)$/)),
      quality: z.string().check(z.regex(/^[\w-]{1,32}$/)),
    }),
  },

  hide: {
    params: z.object({
      id: z.uuidv7(),
    }),
  },
});

export type VideosValidators = InferValidators<typeof videosValidatorsSchema>;
