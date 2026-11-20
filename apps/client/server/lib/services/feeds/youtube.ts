import type { Google, VideoContentType } from "@watcher/common";
import {
  pendingVideoImages,
  pendingVideos,
  type repositoryTypes,
  videos,
  withTransaction,
} from "@watcher/database";
import { to_playlist_id } from "@watcher/integration-google";
import { parse, toSeconds } from "iso8601-duration";

import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { useGoogle } from "#server/lib/google";
import { latest_date } from "#server/utils/sync_schedule";

const NOT_OVER_DELAY = 60 * 60 * 1000;

const FEED_SIZE = 15;

const logger = () => useLogger("services.feeds.youtube");

type Channel = { subscription_id: string; channel_id: string };

type FeedEntries = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useGoogle>["youtube"]["feeds"]["list"]>>
>;

type PendingVideo = repositoryTypes.pendingVideos.ClaimOutput[number];

export default class FeedsYoutube extends AbstractService {
  async enrich(pending: Array<PendingVideo>) {
    const items = await useGoogle().youtube.videos.get_by_ids({
      video_ids: pending.map((video) => video.service_id),
    });
    const items_by_id = new Map(items.map((item) => [item.id, item]));
    const status_of = (video: PendingVideo) =>
      items_by_id.get(video.service_id)?.snippet.liveBroadcastContent;

    const missing = pending.filter((video) => !status_of(video));
    const over = pending.filter((video) => status_of(video) === "none");
    const not_over = pending.filter((video) => ["live", "upcoming"].includes(status_of(video)!));

    const inserted = await withTransaction(async (tx) => {
      const inserted = await videos.insert_new({
        data: over.map((video) => this.to_video(video, items_by_id.get(video.service_id)!)),
        options: { tx },
      });

      await pendingVideoImages.add_many({
        video_ids: inserted.map((video) => video.id),
        options: { tx },
      });

      await pendingVideos.remove_many({
        service: "youtube",
        service_ids: [...over, ...missing].map((video) => video.service_id),
        options: { tx },
      });

      return inserted;
    });

    await pendingVideos.postpone({
      service: "youtube",
      service_ids: not_over.map((video) => video.service_id),
      next_attempt_at: new Date(Date.now() + NOT_OVER_DELAY).toISOString(),
      failed: false,
    });

    await this.index_guests(pending, inserted);

    return { stored: inserted.length, missing: missing.length, not_over: not_over.length };
  }

  private to_video(
    video: PendingVideo,
    item: Google["Youtube"]["Videos"]["Item"],
  ): repositoryTypes.videos.InsertNewData {
    const { snippet } = item;

    return {
      service: "youtube",
      service_id: item.id,
      subscription_id: video.channel_id,
      title: snippet.title,
      description: snippet.description,
      created_at: snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      duration: item.contentDetails.duration ? toSeconds(parse(item.contentDetails.duration)) : 0,
      thumbnail_small: snippet.thumbnails.high.url,
      thumbnail_small_etag: "",
      thumbnail_large: "",
      thumbnail_large_source: snippet.thumbnails.maxres?.url ?? snippet.thumbnails.high.url,
      last_synced_at: new Date().toISOString(),
      ready_at: null,
      content_type: video.content_type,
    };
  }

  private async index_guests(
    pending: Array<PendingVideo>,
    inserted: repositoryTypes.videos.InsertNewOutput,
  ) {
    const channel_names = new Map(pending.map((video) => [video.channel_id, video.channel_name]));
    const by_channel = Map.groupBy(inserted, (video) => video.subscription_id);

    for (const [channel_id, channel_videos] of by_channel) {
      await services.search
        .index_guests({
          service: "youtube",
          channel_name: channel_names.get(channel_id) ?? "",
          videos: channel_videos.map((video) => ({
            service_id: video.service_id,
            title: video.title,
          })),
        })
        .catch((error: unknown) => {
          logger().error(
            { err: error, channel_id },
            "Failed to index the guests of YouTube videos",
          );
        });
    }
  }

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
