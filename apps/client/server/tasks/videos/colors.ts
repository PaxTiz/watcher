import { useDatabase } from "#server/database";
import { async_pool } from "#shared/utils/random";

const BATCH_SIZE = 200;

// Fills the colour of videos synced before colours existed: `pnpm nuxi task run videos:colors`
export default defineTask({
  meta: {
    name: "videos:colors",
    description: "Compute the thumbnail colour of videos that don't have one yet",
  },

  async run() {
    const database = useDatabase();

    let updated = 0;
    let failed = 0;
    let last_id: string | null = null;

    while (true) {
      const videos = await database
        .selectFrom("videos")
        .select(["id", "thumbnail"])
        .where("color", "is", null)
        .$if(last_id !== null, (qb) => qb.where("id", ">", last_id!))
        .orderBy("id")
        .limit(BATCH_SIZE)
        .execute();

      if (videos.length === 0) {
        break;
      }

      await async_pool(videos, 10, async (video) => {
        const color = await extract_image_color(video.thumbnail);
        if (!color) {
          failed++;
          return;
        }

        await database.updateTable("videos").set({ color }).where("id", "=", video.id).execute();
        updated++;
      });

      last_id = videos.at(-1)!.id;
    }

    return { result: { updated, failed } };
  },
});
