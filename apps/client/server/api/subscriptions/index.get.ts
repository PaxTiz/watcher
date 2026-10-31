import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";

export default defineRoute({
  async handler(event) {
    const user = require_user(event);

    return services.subscriptions.find_all(user);
  },
});
