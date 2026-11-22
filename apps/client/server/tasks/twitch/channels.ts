import { subscriptionsSync } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";

const BATCH_SIZE = 1000;
const LEASE_SECONDS = 10 * 60;

export default defineTask({
  meta: {
    name: "twitch:channels",
    description: "Check which Twitch channels are live, and read their VODs when a live ended",
  },

  async run() {
    const started_at = Date.now();

    const channels = await subscriptionsSync.claim_due({
      service: "twitch",
      limit: BATCH_SIZE,
      lease_seconds: LEASE_SECONDS,
    });

    const totals = await services.feeds.twitch.check_channels(channels);

    if (channels.length > 0) {
      useLogger("tasks.twitch.channels").info(
        { ...totals, duration_ms: Date.now() - started_at },
        "Twitch channels checked",
      );
    }

    return { result: totals };
  },
});
