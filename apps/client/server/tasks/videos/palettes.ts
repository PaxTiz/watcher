import { videos } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { extract_image_palette } from "#server/utils/palette";
import { async_pool } from "#shared/utils/random";

const BATCH_SIZE = 200;

export default defineTask({
  meta: {
    name: "videos:palettes",
    description: "Compute the thumbnail palette of videos that don't have one yet",
  },

  async run() {
    const logger = useLogger("tasks.videos.palettes");
    const started_at = Date.now();
    logger.info("Palettes computation started");

    let updated = 0;
    let failed = 0;
    let last_id: string | null = null;

    while (true) {
      const batch = await videos.find_all_without_palette({ after_id: last_id, limit: BATCH_SIZE });

      if (batch.length === 0) {
        break;
      }

      await async_pool(batch, 10, async (video) => {
        const palette = await extract_image_palette(video.thumbnail_small);
        if (!palette) {
          failed++;
          return;
        }

        await videos.update_palette({ id: video.id, palette });
        updated++;
      });

      last_id = batch.at(-1)!.id;
      logger.debug({ batch: batch.length, updated, failed }, "Batch of palettes computed");
    }

    logger.info({ updated, failed, duration_ms: Date.now() - started_at }, "Palettes computed");

    return { result: { updated, failed } };
  },
});
