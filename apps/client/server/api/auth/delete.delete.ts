import { defineRoute } from "#framework";
import { clearUserSession } from "#framework/auth";
import { services } from "#framework/server";
import { require_recent_authentication, require_user } from "#server/utils/session";

export default defineRoute({
  async handler(event) {
    const user = require_user(event);

    await require_recent_authentication(event);

    await services.users.delete(user.id);
    await clearUserSession(event);
  },
});
