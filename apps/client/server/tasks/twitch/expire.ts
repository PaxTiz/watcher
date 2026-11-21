import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";

const MAX_BATCHES = 20;

export default defineTask({
  meta: {
    name: "twitch:expire",
    description: "Remove the Twitch VODs that have expired or were deleted",
  },

  async run() {
    const started_at = Date.now();
    const totals = await services.feeds.twitch.expire_due(MAX_BATCHES);

    if (Object.values(totals).some((count) => count > 0)) {
      useLogger("tasks.twitch.expire").info(
        { ...totals, duration_ms: Date.now() - started_at },
        "Twitch VODs checked",
      );
    }

    return { result: totals };
  },
});
