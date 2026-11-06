import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_session_id, require_user } from "#server/utils/session";

export default defineRoute({
  async handler(event) {
    const user = require_user(event);
    const session_id = require_session_id(event);

    return {
      required: !(await services.sessions.is_recently_authenticated(session_id)),
      has_passkeys: (await services.passkeys.count(user.id)) > 0,
    };
  },
});
