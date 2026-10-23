import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { passkeysValidatorsSchema } from "#shared/validators/passkeys";

export default defineRoute({
  params: passkeysValidatorsSchema.delete.params,

  async handler(event, { params }) {
    const { user } = await requireUserSession(event);

    // Prevents the user from locking themselves out of their account
    const has_integrations = !!user.integrations.google || !!user.integrations.twitch;
    if (!has_integrations && (await services.passkeys.count(user.id)) <= 1) {
      throw createError({ statusCode: 409, message: "last_login_method" });
    }

    const deleted = await services.passkeys.delete(user.id, params.id);
    if (!deleted) {
      throw createError({ statusCode: 404, message: "passkey_not_found" });
    }
  },
});
