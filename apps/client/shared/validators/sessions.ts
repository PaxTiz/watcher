import { z } from "zod/mini";

import { type InferValidators, defineValidator } from "#framework/client";

export const sessionsValidatorsSchema = defineValidator({
  revoke: {
    params: z.object({
      id: z.uuidv4(),
    }),
  },
});

export type SessionsValidators = InferValidators<typeof sessionsValidatorsSchema>;
