import { setTimeout as sleep } from "node:timers/promises";

import type { VideoPalette } from "@watcher/common";

import { AbstractService, useLogger } from "#framework";
import { sync_image } from "#server/utils/images";
import { extract_image_palette } from "#server/utils/palette";
import { video_thumbnail_path } from "#server/utils/sync_images";
import { async_pool } from "#shared/utils/random";

const RETRY_DELAYS = [2_000, 10_000];

type Video = {
  service: "youtube" | "twitch";
  service_id: string;
  subscription_id: string;
  thumbnail_small: string;
};

type Thumbnail = {
  thumbnail_small: string;
  thumbnail_small_etag: string;
  palette: VideoPalette | null;
};

export default class FeedsImages extends AbstractService {
  async with_thumbnails<T extends Video>(videos: Array<T>) {
    const totals = { processed: 0, fallback: 0 };
    const ready: Array<T & Thumbnail> = [];

    await async_pool(videos, 10, async (video) => {
      const thumbnail = await this.thumbnail(video);
      totals[thumbnail.thumbnail_small === video.thumbnail_small ? "fallback" : "processed"]++;

      ready.push({ ...video, ...thumbnail });
    });

    return { videos: ready, totals };
  }

  private async thumbnail(video: Video): Promise<Thumbnail> {
    const path = video_thumbnail_path(video, "small");

    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      if (attempt > 0) {
        await sleep(RETRY_DELAYS[attempt - 1]);
      }

      try {
        const small = await sync_image({
          url: video.thumbnail_small,
          path,
          size: "small",
          current: { path: "", etag: "" },
        });

        if (small) {
          return {
            thumbnail_small: path,
            thumbnail_small_etag: small.etag,
            palette: await extract_image_palette(small.image),
          };
        }
      } catch (error) {
        useLogger("services.feeds.images").warn(
          { err: error, video_id: video.service_id, attempt: attempt + 1 },
          "Failed to process a video thumbnail",
        );
      }
    }

    useLogger("services.feeds.images").warn(
      { service: video.service, video_id: video.service_id, url: video.thumbnail_small },
      "Video thumbnail unavailable: the remote one is used",
    );

    return { thumbnail_small: video.thumbnail_small, thumbnail_small_etag: "", palette: null };
  }
}
