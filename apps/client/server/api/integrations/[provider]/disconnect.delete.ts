import { createError } from "nuxt/server";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { integrationsValidatorsSchema } from "#shared/validators/integrations";

export default defineRoute({
  params: integrationsValidatorsSchema.disconnect.params,

  async handler(event, { params }) {
    const user = require_user(event);

    const service_id = user.integrations[params.provider];
    if (!service_id) {
      throw createError({ status: 404, message: "integration_not_found" });
    }

    // Prevents the user from locking themselves out of their account
    if ((await services.users.count_login_methods(user)) <= 1) {
      throw createError({ status: 409, message: "last_login_method" });
    }

    await services.credentials.delete(user.id, params.provider);

    await services.sessions.revoke_by_login_method(
      user.id,
      { integration: params.provider, id: service_id },
      event.context.session_id,
    );
  },
});
