import { subscriptionsSync } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";
import { latest_date, next_check_at, retry_at } from "#server/utils/sync_schedule";
import { async_pool } from "#shared/utils/random";

const BATCH_SIZE = 200;
const LEASE_SECONDS = 10 * 60;

export default defineTask({
  meta: {
    name: "youtube:feeds",
    description:
      "Check the RSS feeds of the YouTube channels that are due and queue their new videos",
  },

  async run() {
    const logger = useLogger("tasks.youtube.feeds");
    const started_at = Date.now();

    const channels = await subscriptionsSync.claim_due({
      service: "youtube",
      limit: BATCH_SIZE,
      lease_seconds: LEASE_SECONDS,
    });

    if (channels.length === 0) {
      return { result: { checked: 0, discovered: 0, failed: 0 } };
    }

    let discovered = 0;
    let failed = 0;

    await async_pool(channels, 10, async (channel) => {
      try {
        const result = await services.feeds.youtube.sync_channel({
          subscription_id: channel.subscription_id,
          channel_id: channel.service_id,
        });
        discovered += result.discovered.videos + result.discovered.lives;

        await subscriptionsSync.reschedule({
          subscription_id: channel.subscription_id,
          next_check_at: next_check_at(latest_date([channel.last_video_at, result.last_video_at])),
          last_video_at: result.last_video_at,
        });
      } catch (error) {
        failed++;
        logger.error(
          {
            err: error,
            channel_id: channel.service_id,
            channel: channel.name,
            failures: channel.failures + 1,
          },
          "Failed to check the YouTube feeds of a channel",
        );

        await subscriptionsSync.record_failure({
          subscription_id: channel.subscription_id,
          next_check_at: retry_at(channel.failures),
        });
      }
    });

    logger.info(
      { checked: channels.length, discovered, failed, duration_ms: Date.now() - started_at },
      "YouTube feeds checked",
    );

    return { result: { checked: channels.length, discovered, failed } };
  },
});
