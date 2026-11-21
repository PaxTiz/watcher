import { subscriptionsSync } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";

const BATCH_SIZE = 50;
const LEASE_SECONDS = 10 * 60;

export default defineTask({
  meta: {
    name: "twitch:vods",
    description: "Read the VODs of the Twitch channels that are due, store the new ones",
  },

  async run() {
    const started_at = Date.now();

    const channels = await subscriptionsSync.claim_vods_due({
      service: "twitch",
      limit: BATCH_SIZE,
      lease_seconds: LEASE_SECONDS,
    });

    const totals = await services.feeds.twitch.read_vods_due(channels);

    if (channels.length > 0) {
      useLogger("tasks.twitch.vods").info(
        { ...totals, duration_ms: Date.now() - started_at },
        "Twitch VODs read",
      );
    }

    return { result: totals };
  },
});
