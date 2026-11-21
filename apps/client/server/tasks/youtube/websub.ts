import { subscriptionsSync } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { useGoogle } from "#server/lib/google";
import { websub_callback, websub_enabled, websub_secret } from "#server/utils/websub";
import { async_pool } from "#shared/utils/random";

const BATCH_SIZE = 500;
const LEASE_SECONDS = 60 * 60;

export default defineTask({
  meta: {
    name: "youtube:websub",
    description: "Subscribe to the WebSub notifications of the YouTube channels, or renew them",
  },

  async run() {
    if (!websub_enabled()) {
      return {};
    }

    const logger = useLogger("tasks.youtube.websub");
    const started_at = Date.now();

    const channels = await subscriptionsSync.claim_websub_due({
      service: "youtube",
      limit: BATCH_SIZE,
      lease_seconds: LEASE_SECONDS,
    });

    const totals = { requested: 0, failed: 0 };

    await async_pool(channels, 10, async ({ service_id: channel_id }) => {
      try {
        await useGoogle().youtube.websub.subscribe({
          channel_id,
          callback: websub_callback(channel_id),
          secret: websub_secret(channel_id),
        });
        totals.requested++;
      } catch (error) {
        totals.failed++;
        logger.error({ err: error, channel_id }, "Failed to subscribe to a YouTube channel");
      }
    });

    if (channels.length > 0) {
      logger.info(
        { ...totals, duration_ms: Date.now() - started_at },
        "YouTube WebSub subscriptions requested",
      );
    }

    return { result: totals };
  },
});
