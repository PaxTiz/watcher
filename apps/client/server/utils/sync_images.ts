import { remove_image, sync_image } from "#server/utils/images";
import { extract_image_palette } from "#server/utils/palette";
import type { Sync } from "#shared/types/sync";

const channel_directory = (service: string, channel_id: string) =>
  `/${service}/channels/${channel_id}`;

export const video_thumbnail_path = (
  video: Pick<Sync["Video"]["video"], "service" | "service_id" | "subscription_id">,
  size: "small" | "large",
) =>
  `${channel_directory(video.service, video.subscription_id)}/videos/${video.service_id}_${size}`;

export const sync_subscription_logo = async ({ channel }: Sync["Subscription"]) => {
  const path = `${channel_directory(channel.service, channel.service_id)}/logo`;

  const logo = await sync_image({
    url: channel.logo,
    path,
    size: "logo",
    current: { path: channel.logo_local, etag: channel.logo_etag },
  });

  return logo ? { path, etag: logo.etag } : { path: channel.logo_local, etag: channel.logo_etag };
};

// Only the small thumbnail is downloaded: the large one is generated the first time it's displayed
export const sync_video_thumbnail_and_palette = async ({ video }: Sync["Video"]) => {
  const { thumbnail_small_local, ...vid } = video;
  const path = video_thumbnail_path(vid, "small");

  const small = await sync_image({
    url: vid.thumbnail_small,
    path,
    size: "small",
    current: { path: thumbnail_small_local, etag: vid.thumbnail_small_etag },
  });

  if (!small) {
    return {
      ...vid,
      thumbnail_small: thumbnail_small_local,
      palette: vid.palette ?? (await extract_image_palette(thumbnail_small_local)),
    };
  }

  // The thumbnail changed: the large one will be generated again from the new source
  await remove_image(vid.thumbnail_large);

  return {
    ...vid,
    thumbnail_small: path,
    thumbnail_small_etag: small.etag,
    thumbnail_large: "",
    palette: await extract_image_palette(small.image),
  };
};

export const remove_video_thumbnails = async ({ video }: Sync["Video"]) => {
  await Promise.all([
    remove_image(video.thumbnail_small_local),
    remove_image(video.thumbnail_large),
  ]);
};
