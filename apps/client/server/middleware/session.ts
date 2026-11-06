import { defineCachedFunction } from "nitropack/runtime";
import { defineEventHandler } from "nuxt/server";

import { clearUserSession, getUserSession } from "#framework/auth";
import { services } from "#framework/server";

const SEGMENT_ROUTE = /^\/api\/videos\/[^/]+\/segments\//;
const SEGMENT_SESSION_CACHE_TTL = 30; // in seconds

// A player requests a segment every few seconds: this spares a query for each of them, and still
// applies a revocation within the cache lifetime.
const find_segment_user = defineCachedFunction(
  (session_id: string) => services.sessions.find_user(session_id),
  {
    name: "segment_session",
    maxAge: SEGMENT_SESSION_CACHE_TTL,
    swr: false,
    getKey: (session_id: string) => session_id,
  },
);

const find_session_user = (session_id: string, pathname: string) =>
  SEGMENT_ROUTE.test(pathname)
    ? find_segment_user(session_id)
    : services.sessions.find_user(session_id);

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
  const database_user = session_id ? await find_session_user(session_id, pathname) : null;

  if (!session_id || !database_user || database_user.id !== user.id) {
    await clearUserSession(event);
    return;
  }

  event.context.user = database_user;
  event.context.session_id = session_id;
});
