import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { guard_subscriptions_sync } from "#server/utils/sync";

export default defineRoute({
  async handler(event) {
    const user = require_user(event);

    await guard_subscriptions_sync(event, user, () => services.subscriptions.sync(user));
  },
});
