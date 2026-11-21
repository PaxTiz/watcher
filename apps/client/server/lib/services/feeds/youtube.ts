import type { Google, VideoContentType } from "@watcher/common";
import {
  pendingVideoImages,
  pendingVideos,
  type repositoryTypes,
  subscriptionsSync,
  videos,
  withTransaction,
} from "@watcher/database";
import { to_playlist_id } from "@watcher/integration-google";
import { parse, toSeconds } from "iso8601-duration";

import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { useGoogle } from "#server/lib/google";
import { remove_image } from "#server/utils/images";
import type { SyncOptions } from "#server/utils/sync";
import { latest_date, next_check_at, retry_at } from "#server/utils/sync_schedule";
import { async_pool } from "#shared/utils/random";

const NOT_OVER_DELAY = 60 * 60 * 1000;

const FEED_SIZE = 15;

const logger = () => useLogger("services.feeds.youtube");

type Channel = { subscription_id: string; channel_id: string };

type FeedEntries = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useGoogle>["youtube"]["feeds"]["list"]>>
>;

type PendingVideo = repositoryTypes.pendingVideos.ClaimOutput[number];

type ScheduledChannel = repositoryTypes.subscriptionsSync.ClaimDueOutput[number];

type CheckedVideo = repositoryTypes.videos.FindPublishedSinceOutput[number];

const ENRICH_BATCH_SIZE = 50;
const LEASE_SECONDS = 10 * 60;

const MIN_BATCH_FOR_EMPTY_ANSWER = 10;

export default class FeedsYoutube extends AbstractService {
  async check_channels(channels: Array<ScheduledChannel>, options: SyncOptions = { full: false }) {
    const totals = { checked: channels.length, discovered: 0, failed: 0 };

    await async_pool(channels, 10, async (channel) => {
      try {
        const result = await this.sync_channel(
          { subscription_id: channel.subscription_id, channel_id: channel.service_id },
          options,
        );
        totals.discovered += result.discovered.videos + result.discovered.lives;

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

    return totals;
  }

  async enrich_pending(max_batches = Infinity) {
    const totals = { stored: 0, missing: 0, not_over: 0, failed: 0 };

    for (let batch = 0; batch < max_batches; batch++) {
      const pending = await pendingVideos.claim({
        service: "youtube",
        limit: ENRICH_BATCH_SIZE,
        lease_seconds: LEASE_SECONDS,
      });

      if (pending.length === 0) {
        break;
      }

      try {
        const result = await this.enrich(pending);
        totals.stored += result.stored;
        totals.missing += result.missing;
        totals.not_over += result.not_over;
      } catch (error) {
        totals.failed += pending.length;
        logger().error({ err: error, videos: pending.length }, "Failed to enrich YouTube videos");

        await pendingVideos.postpone({
          service: "youtube",
          service_ids: pending.map((video) => video.service_id),
          next_attempt_at: retry_at(Math.max(...pending.map((video) => video.attempts))),
          failed: true,
        });
      }

      if (pending.length < ENRICH_BATCH_SIZE) {
        break;
      }
    }

    return totals;
  }

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

  async check(to_check: Array<CheckedVideo>) {
    const items = await useGoogle().youtube.videos.get_by_ids({
      video_ids: to_check.map((video) => video.service_id),
    });

    if (items.length === 0 && to_check.length >= MIN_BATCH_FOR_EMPTY_ANSWER) {
      throw new Error(`YouTube returned none of the ${to_check.length} checked videos`);
    }

    const returned = new Set(items.map((item) => item.id));
    const kept = to_check.filter((video) => returned.has(video.service_id));
    const deleted = to_check.filter((video) => !returned.has(video.service_id));

    await videos.mark_checked({ ids: kept.map((video) => video.id) });

    if (deleted.length > 0) {
      await videos.remove_many({ ids: deleted.map((video) => video.id) });
      await Promise.all(
        deleted.flatMap((video) => [
          remove_image(video.thumbnail_small),
          remove_image(video.thumbnail_large),
        ]),
      );

      logger().info(
        { videos: deleted.map((video) => video.service_id) },
        "Deleted or private YouTube videos removed",
      );
    }

    return { kept: kept.length, deleted: deleted.map((video) => video.id) };
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

  async sync_channel(channel: Channel, options: SyncOptions) {
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
      videos: await this.sync_playlist(channel, "video", videos, options),
      lives: await this.sync_playlist(channel, "live", lives, options),
    };

    const last_video_at = latest_date([...videos, ...lives].map((entry) => entry.published_at));

    logger().debug({ channel_id: channel.channel_id, ...discovered }, "YouTube feeds checked");

    return { discovered, last_video_at };
  }

  private async sync_playlist(
    channel: Channel,
    content_type: VideoContentType,
    entries: FeedEntries,
    options: SyncOptions,
  ) {
    await this.check_missing_from_feed(channel, content_type, entries);

    let video_ids = entries.map((entry) => entry.video_id);
    let known = await pendingVideos.find_known({ service: "youtube", service_ids: video_ids });

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
