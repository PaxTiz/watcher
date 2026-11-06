import { createError } from "nuxt/server";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_recent_authentication, require_user } from "#server/utils/session";
import { passkeysValidatorsSchema } from "#shared/validators/passkeys";

export default defineRoute({
  params: passkeysValidatorsSchema.delete.params,

  async handler(event, { params }) {
    const user = require_user(event);

    await require_recent_authentication(event);

    // Prevents the user from locking themselves out of their account
    if ((await services.users.count_login_methods(user)) <= 1) {
      throw createError({ status: 409, message: "last_login_method" });
    }

    const deleted = await services.passkeys.delete(user.id, params.id);
    if (!deleted) {
      throw createError({ status: 404, message: "passkey_not_found" });
    }

    await services.sessions.revoke_by_login_method(
      user.id,
      { integration: "passkey", id: params.id },
      event.context.session_id,
    );
  },
});
