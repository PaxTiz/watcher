import { videos } from "@watcher/database";

import { async_pool } from "#shared/utils/random";

const BATCH_SIZE = 200;

export default defineTask({
  meta: {
    name: "videos:palettes",
    description: "Compute the thumbnail palette of videos that don't have one yet",
  },

  async run() {
    let updated = 0;
    let failed = 0;
    let last_id: string | null = null;

    while (true) {
      const batch = await videos.find_all_without_palette({ after_id: last_id, limit: BATCH_SIZE });

      if (batch.length === 0) {
        break;
      }

      await async_pool(batch, 10, async (video) => {
        const palette = await extract_image_palette(video.thumbnail_large);
        if (!palette) {
          failed++;
          return;
        }

        await videos.update_palette({ id: video.id, palette });
        updated++;
      });

      last_id = batch.at(-1)!.id;
    }

    return { result: { updated, failed } };
  },
});
