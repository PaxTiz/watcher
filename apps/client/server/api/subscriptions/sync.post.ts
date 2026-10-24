import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  async handler(event) {
    const user = require_user(event);

    await services.subscriptions.sync(user);
  },
});
