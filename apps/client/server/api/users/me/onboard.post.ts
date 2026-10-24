import { z } from "zod/mini";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { booleanSchema } from "#shared/validators/shared";

export default defineRoute({
  body: z.object({
    sync: booleanSchema,
  }),

  async handler(event, { body }) {
    const user = require_user(event);

    await services.users.onboard(user, body.sync);
  },
});
