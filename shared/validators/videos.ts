import { type InferValidators, defineValidator } from "#framework";
import { z } from "zod/mini";

export const videosValidatorsSchema = defineValidator({
  find: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },

  list: {
    query: z.object({
      page: z.coerce.number().check(z.gte(1)),
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
    }),
  },
});

export type VideosValidators = InferValidators<typeof videosValidatorsSchema>;
