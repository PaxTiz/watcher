import { z } from "zod/mini";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { guard_subscriptions_sync } from "#server/utils/sync";
import { booleanSchema } from "#shared/validators/shared";

export default defineRoute({
  body: z.object({
    sync: booleanSchema,
  }),

  async handler(event, { body }) {
    const user = require_user(event);

    if (body.sync) {
      await guard_subscriptions_sync(event, user, () => services.users.onboard(user, true));
    } else {
      await services.users.onboard(user, false);
    }
  },
});
