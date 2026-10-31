import { defineNitroPlugin } from "nitropack/runtime";

import { sessionHooks } from "#framework/auth";
import { services } from "#framework/server";

export default defineNitroPlugin(() => {
  // `GET /api/_auth/session` reads the cookie: expose the user checked by the session middleware
  // instead, so the client never sees a revoked session or stale user data.
  sessionHooks.hook("fetch", (session, event) => {
    session.user = event.context.user;
  });

  sessionHooks.hook("clear", async (session) => {
    if (session.secure?.session_id) {
      await services.sessions.revoke(session.secure.session_id);
    }
  });
});
