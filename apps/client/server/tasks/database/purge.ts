import { rateLimits, sessions, webauthnChallenges } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";

export default defineTask({
  meta: {
    name: "database:purge",
    description: "Delete the expired sessions, rate limit windows and WebAuthn challenges",
  },

  async run() {
    const [expired_sessions, rate_limits, webauthn_challenges] = await Promise.all([
      sessions.remove_expired(),
      rateLimits.remove_expired(),
      webauthnChallenges.remove_expired(),
    ]);

    const result = { sessions: expired_sessions, rate_limits, webauthn_challenges };
    useLogger("tasks.database.purge").info(result, "Expired rows purged");

    return { result };
  },
});
