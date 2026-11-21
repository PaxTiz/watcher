import { sync_image } from "#server/utils/images";
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
