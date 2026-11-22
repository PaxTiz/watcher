import { externalRequests, rateLimits, sessions, webauthnChallenges } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";

const EXTERNAL_REQUESTS_RETENTION_DAYS = 90;

export default defineTask({
  meta: {
    name: "database:purge",
    description:
      "Delete the expired sessions, rate limit windows, WebAuthn challenges and old stats",
  },

  async run() {
    const [expired_sessions, rate_limits, webauthn_challenges, external_requests] =
      await Promise.all([
        sessions.remove_expired(),
        rateLimits.remove_expired(),
        webauthnChallenges.remove_expired(),
        externalRequests.remove_older_than({
          before: new Date(
            Date.now() - EXTERNAL_REQUESTS_RETENTION_DAYS * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }),
      ]);

    const result = {
      sessions: expired_sessions,
      rate_limits,
      webauthn_challenges,
      external_requests,
    };
    useLogger("tasks.database.purge").info(result, "Expired rows purged");

    return { result };
  },
});
