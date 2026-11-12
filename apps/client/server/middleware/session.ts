import { defineEventHandler } from "nuxt/server";

import { useLogger } from "#framework";
import { clearUserSession, getUserSession } from "#framework/auth";
import { services } from "#framework/server";

// Checks the session cookie against the `sessions` table, and loads the user from the
// database: a revoked or expired session is cleared, whatever the cookie still contains.
export default defineEventHandler(async (event) => {
  const { pathname } = event.url;
  if (!pathname.startsWith("/api/") || pathname.startsWith("/api/_nuxt_icon")) {
    return;
  }

  const { user, secure } = await getUserSession(event);
  if (!user) {
    return;
  }

  const session_id = secure?.session_id;
  const database_user = session_id ? await services.sessions.find_user(session_id) : null;

  if (!session_id || !database_user || database_user.id !== user.id) {
    useLogger("server.middleware.session").info(
      {
        session_id,
        cookie_user_id: user.id,
        reason: !session_id
          ? "missing_session_id"
          : !database_user
            ? "revoked_or_expired"
            : "user_mismatch",
      },
      "Invalid session cleared",
    );

    await clearUserSession(event);
    return;
  }

  event.context.user = database_user;
  event.context.session_id = session_id;
});
