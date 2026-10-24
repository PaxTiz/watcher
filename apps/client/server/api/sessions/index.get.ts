import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  async handler(event) {
    const user = require_user(event);

    return services.sessions.list(user.id, require_session_id(event));
  },
});
