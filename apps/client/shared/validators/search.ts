import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework/client";

import { queryArraySchema, videoDurationSchema } from "./shared";

export const searchValidatorsSchema = defineValidator({
  search: {
    query: z.object({
      query: z.optional(z.string().check(z.maxLength(100))),
      type: z._default(z.enum(["all", "videos", "channels"]), "all"),
      duration: z.optional(videoDurationSchema),
      sort: z._default(z.enum(["relevance", "recent"]), "relevance"),
      guests: z.optional(queryArraySchema(z.string().check(z.minLength(1), z.maxLength(100)), 10)),
    }),
  },
});

export type SearchValidators = InferValidators<typeof searchValidatorsSchema>;
