import { z } from "zod/mini";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { start_subscriptions_sync } from "#server/utils/sync";
import { booleanSchema } from "#shared/validators/shared";

export default defineRoute({
  body: z.object({
    sync: booleanSchema,
  }),

  async handler(event, { body }) {
    const user = require_user(event);

    await services.users.onboard(user);

    if (body.sync) {
      await start_subscriptions_sync(event, user, () =>
        services.subscriptions.sync(user, { full: false, channels: "new" }),
      );
    }
  },
});
