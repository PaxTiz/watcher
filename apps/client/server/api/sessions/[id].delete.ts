import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { sessionsValidatorsSchema } from "#shared/validators/sessions";

export default defineRoute({
  params: sessionsValidatorsSchema.revoke.params,

  async handler(event, { params }) {
    const user = require_user(event);

    if (params.id === require_session_id(event)) {
      throw createError({ statusCode: 409, message: "current_session" });
    }

    const revoked = await services.sessions.revoke(params.id, user.id);
    if (!revoked) {
      throw createError({ statusCode: 404, message: "session_not_found" });
    }
  },
});
