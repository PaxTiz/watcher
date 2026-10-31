import { createError } from "nuxt/server";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { passkeysValidatorsSchema } from "#shared/validators/passkeys";

export default defineRoute({
  params: passkeysValidatorsSchema.rename.params,
  body: passkeysValidatorsSchema.rename.body,

  async handler(event, { params, body }) {
    const user = require_user(event);

    const renamed = await services.passkeys.rename(user.id, params.id, body.name);
    if (!renamed) {
      throw createError({ status: 404, message: "passkey_not_found" });
    }
  },
});
