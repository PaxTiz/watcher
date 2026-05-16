import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { integrationsValidatorsSchema } from "#shared/validators/integrations";

export default defineRoute({
  params: integrationsValidatorsSchema.disconnect.params,

  async handler(event, { params }) {
    const { user: sessionUser } = await requireUserSession(event);

    if (params.provider === "bluesky") {
      await services.users.update(sessionUser.id, {
        bluesky_did: null,
        bluesky_handle: null,
      });
    } else {
      await services.credentials.delete(sessionUser.id, params.provider);
    }

    const database_user = await services.users.find_by_id(sessionUser.id);
    if (!database_user) {
      throw createError({
        statusCode: 500,
        message: "authenticated_user_not_found",
      });
    }

    await set_user_session(event, database_user, sessionUser.login_with);
  },
});
