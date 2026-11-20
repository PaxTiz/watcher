import { pendingVideoImages } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";
import { async_pool } from "#shared/utils/random";

const BATCH_SIZE = 50;
const MAX_BATCHES = 10;
const LEASE_SECONDS = 10 * 60;

export default defineTask({
  meta: {
    name: "videos:images",
    description: "Process the thumbnail of the new videos, which are hidden until then",
  },

  async run() {
    const logger = useLogger("tasks.videos.images");
    const started_at = Date.now();
    const totals = { processed: 0, skipped: 0, fallback: 0, failed: 0 };

    for (let batch = 0; batch < MAX_BATCHES; batch++) {
      const pending = await pendingVideoImages.claim({
        limit: BATCH_SIZE,
        lease_seconds: LEASE_SECONDS,
      });

      if (pending.length === 0) {
        break;
      }

      await async_pool(pending, 10, async (video) => {
        try {
          totals[await services.feeds.images.process(video)]++;
        } catch (error) {
          totals.failed++;
          logger.error({ err: error, video_id: video.id }, "Failed to process a video thumbnail");
        }
      });

      if (pending.length < BATCH_SIZE) {
        break;
      }
    }

    if (Object.values(totals).some((count) => count > 0)) {
      logger.info(
        { ...totals, duration_ms: Date.now() - started_at },
        "Video thumbnails processed",
      );
    }

    return { result: totals };
  },
});
