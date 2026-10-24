import { services } from "#framework/server";

// Checks the session cookie against the `sessions` table, and loads the user from the
// database: a revoked or expired session is cleared, whatever the cookie still contains.
export default defineEventHandler(async (event) => {
  if (!event.path.startsWith("/api/") || event.path.startsWith("/api/_nuxt_icon")) {
    return;
  }

  const { user, secure } = await getUserSession(event);
  if (!user) {
    return;
  }

  const session_id = secure?.session_id;
  const database_user = session_id ? await services.sessions.find_user(session_id) : null;

  if (!session_id || !database_user || database_user.id !== user.id) {
    await clearUserSession(event);
    return;
  }

  event.context.user = database_user;
  event.context.session_id = session_id;
});
