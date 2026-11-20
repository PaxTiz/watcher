import type { repositoryTypes } from "@watcher/database";
import { pendingVideoImages, videos, withTransaction } from "@watcher/database";

import { AbstractService } from "#framework";
import { sync_image } from "#server/utils/images";
import { extract_image_palette } from "#server/utils/palette";
import { video_thumbnail_path } from "#server/utils/sync_images";
import { retry_at } from "#server/utils/sync_schedule";

const MAX_ATTEMPTS = 5;

type PendingImage = repositoryTypes.pendingVideoImages.ClaimOutput[number];

export default class FeedsImages extends AbstractService {
  async process(video: PendingImage) {
    if (video.ready_at) {
      await pendingVideoImages.remove({ video_id: video.id });

      return "skipped";
    }

    const path = video_thumbnail_path(video, "small");
    const small = await sync_image({
      url: video.thumbnail_small,
      path,
      size: "small",
      current: { path: "", etag: "" },
    });

    if (small) {
      const palette = await extract_image_palette(small.image);
      await this.mark_ready(video.id, {
        thumbnail_small: path,
        thumbnail_small_etag: small.etag,
        palette,
      });

      return "processed";
    }

    if (video.attempts + 1 >= MAX_ATTEMPTS) {
      await this.mark_ready(video.id, {
        thumbnail_small: video.thumbnail_small,
        thumbnail_small_etag: "",
        palette: null,
      });

      return "fallback";
    }

    await pendingVideoImages.record_failure({
      video_id: video.id,
      next_attempt_at: retry_at(video.attempts),
    });

    return "failed";
  }

  private async mark_ready(
    id: string,
    data: Omit<repositoryTypes.videos.MarkReadyInput, "id" | "options">,
  ) {
    await withTransaction(async (tx) => {
      await videos.mark_ready({ id, ...data, options: { tx } });
      await pendingVideoImages.remove({ video_id: id, options: { tx } });
    });
  }
}
