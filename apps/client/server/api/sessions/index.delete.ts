import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  async handler(event) {
    const user = require_user(event);

    await services.sessions.revoke_others(user.id, require_session_id(event));
  },
});
