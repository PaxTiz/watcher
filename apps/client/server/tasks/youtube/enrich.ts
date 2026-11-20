import { pendingVideos } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";
import { retry_at } from "#server/utils/sync_schedule";

const BATCH_SIZE = 50;
const MAX_BATCHES = 20;
const LEASE_SECONDS = 10 * 60;

export default defineTask({
  meta: {
    name: "youtube:enrich",
    description: "Fetch the details of the pending YouTube videos and store them",
  },

  async run() {
    const logger = useLogger("tasks.youtube.enrich");
    const started_at = Date.now();
    const totals = { stored: 0, missing: 0, not_over: 0, failed: 0 };

    for (let batch = 0; batch < MAX_BATCHES; batch++) {
      const pending = await pendingVideos.claim({
        service: "youtube",
        limit: BATCH_SIZE,
        lease_seconds: LEASE_SECONDS,
      });

      if (pending.length === 0) {
        break;
      }

      try {
        const result = await services.feeds.youtube.enrich(pending);
        totals.stored += result.stored;
        totals.missing += result.missing;
        totals.not_over += result.not_over;
      } catch (error) {
        totals.failed += pending.length;
        logger.error({ err: error, videos: pending.length }, "Failed to enrich YouTube videos");

        await pendingVideos.postpone({
          service: "youtube",
          service_ids: pending.map((video) => video.service_id),
          next_attempt_at: retry_at(Math.max(...pending.map((video) => video.attempts))),
          failed: true,
        });
      }

      if (pending.length < BATCH_SIZE) {
        break;
      }
    }

    if (Object.values(totals).some((count) => count > 0)) {
      logger.info({ ...totals, duration_ms: Date.now() - started_at }, "YouTube videos enriched");
    }

    return { result: totals };
  },
});
