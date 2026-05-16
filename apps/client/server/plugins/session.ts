import { useLogger } from "#framework";
import { services } from "#framework/server";

export default defineNitroPlugin(() => {
  sessionHooks.hook("fetch", async (session, event) => {
    if (!session.user?.id) {
      return;
    }

    try {
      const database_user = await services.users.find_by_id(session.user.id);
      if (!database_user) {
        await clearUserSession(event);
        return;
      }

      session.user = {
        ...database_user,
        login_with: session.user.login_with,
      };
    } catch (error) {
      useLogger("server.hooks.session").error(error);
      throw createError({ statusCode: 500, message: "failed_to_fetch_user_session" });
    }
  });
});
