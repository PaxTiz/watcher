import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework/client";

const idOrSlugParams = z.object({
  id_or_slug: z.string().check(z.minLength(1), z.maxLength(255)),
});

export const subscriptionsValidatorsSchema = defineValidator({
  list: {
    query: z.object({
      query: z.optional(z.string().check(z.maxLength(100))),
    }),
  },
  find: { params: idOrSlugParams },
  favorite: { params: idOrSlugParams },
  hide: { params: idOrSlugParams },
  show: { params: idOrSlugParams },
});

export type SubscriptionsValidators = InferValidators<typeof subscriptionsValidatorsSchema>;
