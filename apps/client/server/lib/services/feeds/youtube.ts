import type { Google, VideoContentType } from "@watcher/common";
import { type repositoryTypes, subscriptionsSync, videos } from "@watcher/database";
import { to_playlist_id } from "@watcher/integration-google";
import { parse, toSeconds } from "iso8601-duration";

import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { useGoogle } from "#server/lib/google";
import type { SyncOptions } from "#server/utils/sync";
import { apply_videos_check } from "#server/utils/sync_check";
import { latest_date, next_check_at, retry_at } from "#server/utils/sync_schedule";
import { async_pool, chunk } from "#shared/utils/random";

const FEED_SIZE = 15;

const BATCH_SIZE = 50;

const logger = () => useLogger("services.feeds.youtube");

type Channel = { subscription_id: string; channel_id: string; name: string };

type FeedEntries = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useGoogle>["youtube"]["feeds"]["list"]>>
>;

type DiscoveredVideo = { service_id: string; content_type: VideoContentType; channel: Channel };

type ScheduledChannel = repositoryTypes.subscriptionsSync.ClaimDueOutput[number];

type CheckedVideo = repositoryTypes.videos.FindPublishedSinceOutput[number];

export default class FeedsYoutube extends AbstractService {
  async check_channels(
    channels: Array<ScheduledChannel>,
    options: Pick<SyncOptions, "full"> = { full: false },
  ) {
    const totals = { checked: channels.length, failed: 0 };
    const discovered = new Map<string, DiscoveredVideo>();

    await async_pool(channels, 10, async (channel) => {
      try {
        const result = await this.sync_channel(
          {
            subscription_id: channel.subscription_id,
            channel_id: channel.service_id,
            name: channel.name,
          },
          options,
        );
        for (const video of result.discovered) {
          discovered.set(video.service_id, video);
        }

        await subscriptionsSync.reschedule({
          subscription_id: channel.subscription_id,
          next_check_at: next_check_at(
            latest_date([channel.last_video_at, result.last_video_at]),
            channel.websub_expires_at,
          ),
          last_video_at: result.last_video_at,
        });
      } catch (error) {
        totals.failed++;
        logger().error(
          {
            err: error,
            channel_id: channel.service_id,
            channel: channel.name,
            failures: channel.failures + 1,
          },
          "Failed to check the YouTube feeds of a channel",
        );

        await subscriptionsSync.record_failure({
          subscription_id: channel.subscription_id,
          next_check_at: retry_at(channel.failures),
        });
      }
    });

    return {
      ...totals,
      discovered: discovered.size,
      ...(await this.store([...discovered.values()])),
    };
  }

  private async store(discovered: Array<DiscoveredVideo>) {
    const totals = { stored: 0, missing: 0, not_over: 0, fallback: 0, failed: 0 };

    for (const batch of chunk(discovered, BATCH_SIZE)) {
      try {
        const result = await this.store_batch(batch);
        totals.stored += result.stored;
        totals.missing += result.missing;
        totals.not_over += result.not_over;
        totals.fallback += result.fallback;
      } catch (error) {
        totals.failed += batch.length;
        logger().error({ err: error, videos: batch.length }, "Failed to store YouTube videos");
      }
    }

    return totals;
  }

  private async store_batch(batch: Array<DiscoveredVideo>) {
    const items = await useGoogle().youtube.videos.get_by_ids({
      video_ids: batch.map((video) => video.service_id),
    });
    const items_by_id = new Map(items.map((item) => [item.id, item]));
    const status_of = (video: DiscoveredVideo) =>
      items_by_id.get(video.service_id)?.snippet.liveBroadcastContent;

    const over = batch.filter((video) => status_of(video) === "none");
    const missing = batch.filter((video) => !status_of(video)).length;

    const { videos: ready, totals } = await services.feeds.images.with_thumbnails(
      over.map((video) => this.to_video(video, items_by_id.get(video.service_id)!)),
    );
    const inserted = await videos.insert_new({ data: ready });

    await this.index_guests(batch, inserted);

    return {
      stored: inserted.length,
      missing,
      not_over: batch.length - over.length - missing,
      fallback: totals.fallback,
    };
  }

  async check(to_check: Array<CheckedVideo>) {
    const items = await useGoogle().youtube.videos.get_by_ids({
      video_ids: to_check.map((video) => video.service_id),
    });

    return apply_videos_check("youtube", to_check, new Set(items.map((item) => item.id)));
  }

  private to_video(
    video: DiscoveredVideo,
    item: Google["Youtube"]["Videos"]["Item"],
  ): repositoryTypes.videos.InsertNewData {
    const { snippet } = item;

    return {
      service: "youtube",
      service_id: item.id,
      subscription_id: video.channel.channel_id,
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
      content_type: video.content_type,
      palette: null,
    };
  }

  private async index_guests(
    batch: Array<DiscoveredVideo>,
    inserted: repositoryTypes.videos.InsertNewOutput,
  ) {
    const channel_names = new Map(
      batch.map((video) => [video.channel.channel_id, video.channel.name]),
    );
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

  async sync_channel(channel: Channel, options: Pick<SyncOptions, "full">) {
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

    const discovered = [
      ...(await this.sync_playlist(channel, "video", videos, options)),
      ...(await this.sync_playlist(channel, "live", lives, options)),
    ];

    const last_video_at = latest_date([...videos, ...lives].map((entry) => entry.published_at));

    logger().debug(
      { channel_id: channel.channel_id, discovered: discovered.length },
      "YouTube feeds checked",
    );

    return { discovered, last_video_at };
  }

  private async sync_playlist(
    channel: Channel,
    content_type: VideoContentType,
    entries: FeedEntries,
    options: Pick<SyncOptions, "full">,
  ): Promise<Array<DiscoveredVideo>> {
    await this.check_missing_from_feed(channel, content_type, entries);

    let video_ids = entries.map((entry) => entry.video_id);
    let known = await videos.find_known({ service: "youtube", service_ids: video_ids });

    if ((options.full || known.length === 0) && entries.length >= FEED_SIZE) {
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
      known = await videos.find_known({ service: "youtube", service_ids: video_ids });
    }

    return video_ids
      .filter((id) => !known.includes(id))
      .map((service_id) => ({ service_id, content_type, channel }));
  }

  private async check_missing_from_feed(
    channel: Channel,
    content_type: VideoContentType,
    entries: FeedEntries,
  ) {
    const oldest = entries.reduce<string | null>(
      (min, entry) =>
        !min || new Date(entry.published_at) < new Date(min) ? entry.published_at : min,
      null,
    );
    if (!oldest) {
      return;
    }

    const listed = new Set(entries.map((entry) => entry.video_id));
    const stored = await videos.find_published_since({
      service: "youtube",
      subscription_id: channel.channel_id,
      content_type,
      since: oldest,
    });

    await videos.mark_checked({
      ids: stored.filter((video) => listed.has(video.service_id)).map((video) => video.id),
    });

    const missing = stored.filter((video) => !listed.has(video.service_id));
    if (missing.length === 0) {
      return;
    }

    try {
      await this.check(missing);
    } catch (error) {
      logger().warn(
        { err: error, channel_id: channel.channel_id, videos: missing.length },
        "Failed to check the YouTube videos missing from a feed",
      );
    }
  }
}
