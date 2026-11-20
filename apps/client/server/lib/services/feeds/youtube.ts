import type { VideoContentType } from "@watcher/common";
import { pendingVideos } from "@watcher/database";
import { to_playlist_id } from "@watcher/integration-google";

import { AbstractService, useLogger } from "#framework";
import { useGoogle } from "#server/lib/google";
import { latest_date } from "#server/utils/sync_schedule";

const FEED_SIZE = 15;

const logger = () => useLogger("services.feeds.youtube");

type Channel = { subscription_id: string; channel_id: string };

type FeedEntries = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useGoogle>["youtube"]["feeds"]["list"]>>
>;

export default class FeedsYoutube extends AbstractService {
  async sync_channel(channel: Channel) {
    const google = useGoogle();

    const videos = await google.youtube.feeds.list({
      playlist_id: to_playlist_id(channel.channel_id, "videos"),
    });
    if (!videos) {
      throw new Error(`YouTube videos feed not found for channel '${channel.channel_id}'`);
    }

    const lives =
      (await google.youtube.feeds.list({
        playlist_id: to_playlist_id(channel.channel_id, "lives"),
      })) ?? [];

    const discovered = {
      videos: await this.sync_playlist(channel, "video", videos),
      lives: await this.sync_playlist(channel, "live", lives),
    };

    const last_video_at = latest_date([...videos, ...lives].map((entry) => entry.published_at));

    logger().debug({ channel_id: channel.channel_id, ...discovered }, "YouTube feeds checked");

    return { discovered, last_video_at };
  }

  private async sync_playlist(
    channel: Channel,
    content_type: VideoContentType,
    entries: FeedEntries,
  ) {
    let video_ids = entries.map((entry) => entry.video_id);
    let known = await pendingVideos.find_known({ service: "youtube", service_ids: video_ids });

    if (known.length === 0 && entries.length >= FEED_SIZE) {
      const playlist_id = to_playlist_id(
        channel.channel_id,
        content_type === "live" ? "lives" : "videos",
      );
      logger().debug(
        { channel_id: channel.channel_id, playlist_id },
        "YouTube feed full: fallback to the API",
      );

      const items = await useGoogle().youtube.playlist_items.list({ playlist_id });
      video_ids = items.map((item) => item.contentDetails.videoId);
      known = await pendingVideos.find_known({ service: "youtube", service_ids: video_ids });
    }

    const new_ids = video_ids.filter((id) => !known.includes(id));

    await pendingVideos.add_many({
      data: new_ids.map((service_id) => ({
        service: "youtube",
        service_id,
        subscription_id: channel.subscription_id,
        content_type,
      })),
    });

    return new_ids.length;
  }
}
