import { pendingVideoImages, pendingVideos, subscriptionsSync } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";

const MAX_LAG_SECONDS = 60 * 60;
const MAX_FAILING_RATIO = 0.05;

export default defineTask({
  meta: {
    name: "sync:health",
    description: "Log the lag and size of the YouTube sync queues, warn when they fall behind",
  },

  async run() {
    const [feeds, enrich, images] = await Promise.all([
      subscriptionsSync.stats({ service: "youtube" }),
      pendingVideos.stats({ service: "youtube" }),
      pendingVideoImages.stats(),
    ]);

    const failing_ratio = feeds.scheduled > 0 ? feeds.failing / feeds.scheduled : 0;
    const alerts = [
      feeds.lag_seconds > MAX_LAG_SECONDS && "feeds_lagging",
      failing_ratio > MAX_FAILING_RATIO && "feeds_failing",
      enrich.lag_seconds > MAX_LAG_SECONDS && "enrich_lagging",
      images.lag_seconds > MAX_LAG_SECONDS && "images_lagging",
    ].filter(Boolean);

    const result = { feeds: { ...feeds, failing_ratio }, enrich, images, alerts };
    const logger = useLogger("tasks.sync.health");

    if (alerts.length > 0) {
      logger.warn(result, "YouTube sync falling behind");
    } else {
      logger.info(result, "YouTube sync healthy");
    }

    return { result };
  },
});
