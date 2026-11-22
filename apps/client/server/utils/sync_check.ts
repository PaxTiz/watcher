import { videos } from "@watcher/database";

import { useLogger } from "#framework";
import { remove_image } from "#server/utils/images";

const MIN_BATCH_FOR_EMPTY_ANSWER = 10;

type CheckedVideo = {
  id: string;
  service_id: string;
  thumbnail_small: string;
  thumbnail_large: string;
};

export const apply_videos_check = async (
  service: "youtube" | "twitch",
  to_check: Array<CheckedVideo>,
  found_ids: Set<string>,
) => {
  if (found_ids.size === 0 && to_check.length >= MIN_BATCH_FOR_EMPTY_ANSWER) {
    throw new Error(`${service} returned none of the ${to_check.length} checked videos`);
  }

  const kept = to_check.filter((video) => found_ids.has(video.service_id));
  const gone = to_check.filter((video) => !found_ids.has(video.service_id));

  await videos.mark_checked({ ids: kept.map((video) => video.id) });

  if (gone.length > 0) {
    await videos.remove_many({ ids: gone.map((video) => video.id) });
    await Promise.all(
      gone.flatMap((video) => [
        remove_image(video.thumbnail_small),
        remove_image(video.thumbnail_large),
      ]),
    );

    useLogger("server.utils.sync_check").info(
      { service, videos: gone.map((video) => video.service_id) },
      "Deleted, private or expired videos removed",
    );
  }

  return { kept: kept.length, deleted: gone.map((video) => video.id) };
};
