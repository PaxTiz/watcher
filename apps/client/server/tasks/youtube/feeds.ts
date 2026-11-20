import { subscriptionsSync } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";

const BATCH_SIZE = 200;
const LEASE_SECONDS = 10 * 60;

export default defineTask({
  meta: {
    name: "youtube:feeds",
    description:
      "Check the RSS feeds of the YouTube channels that are due and queue their new videos",
  },

  async run() {
    const started_at = Date.now();

    const channels = await subscriptionsSync.claim_due({
      service: "youtube",
      limit: BATCH_SIZE,
      lease_seconds: LEASE_SECONDS,
    });

    const totals = await services.feeds.youtube.check_channels(channels);

    if (channels.length > 0) {
      useLogger("tasks.youtube.feeds").info(
        { ...totals, duration_ms: Date.now() - started_at },
        "YouTube feeds checked",
      );
    }

    return { result: totals };
  },
});
