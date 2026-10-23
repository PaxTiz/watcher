import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { passkeysValidatorsSchema } from "#shared/validators/passkeys";

export default defineRoute({
  params: passkeysValidatorsSchema.rename.params,
  body: passkeysValidatorsSchema.rename.body,

  async handler(event, { params, body }) {
    const { user } = await requireUserSession(event);

    const renamed = await services.passkeys.rename(user.id, params.id, body.name);
    if (!renamed) {
      throw createError({ statusCode: 404, message: "passkey_not_found" });
    }
  },
});
