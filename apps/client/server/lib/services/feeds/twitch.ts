import type { Twitch } from "@watcher/common";
import {
  pendingVideoImages,
  type repositoryTypes,
  subscriptionsSync,
  videos,
  withTransaction,
} from "@watcher/database";
import { MAX_STREAMS_PER_REQUEST, MAX_VIDEOS_PER_REQUEST } from "@watcher/integration-twitch";

import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { useTwitch } from "#server/lib/twitch";
import { eventsub_callback, eventsub_secret } from "#server/utils/eventsub";
import type { SyncOptions } from "#server/utils/sync";
import { apply_videos_check } from "#server/utils/sync_check";
import {
  latest_date,
  next_live_check_at,
  next_vods_read_at,
  retry_at,
} from "#server/utils/sync_schedule";
import {
  is_twitch_placeholder_thumbnail,
  twitch_duration_seconds,
  twitch_thumbnail_url,
} from "#server/utils/twitch";
import { async_pool } from "#shared/utils/random";

const logger = () => useLogger("services.feeds.twitch");

type ScheduledChannel = repositoryTypes.subscriptionsSync.ClaimDueOutput[number];

type VodsChannel = repositoryTypes.subscriptionsSync.ClaimVodsDueOutput[number];

type Vod = Twitch["Videos"]["List"]["data"][number];

type CheckedVod = repositoryTypes.videos.ClaimToCheckOutput[number];

const chunk = <T>(items: Array<T>, size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );

const VODS_DELAY_SECONDS = 10 * 60;

const FIRST_READ_SIZE = 100;
const NEXT_READS_SIZE = 20;

const PLACEHOLDER_RETRY_MINUTES = 30;
const FAILURE_RETRY_MINUTES = 60;

const EXPIRY_MIN_AGE = 6 * 24 * 60 * 60 * 1000;
const EXPIRY_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

const EVENTSUB_TYPE = "stream.offline";
const EVENTSUB_DEFAULT_MAX_COST = 10_000;
const EVENTSUB_MAX_CHANGES = 300;
const EVENTSUB_HEALTHY = ["enabled", "webhook_callback_verification_pending"];

const in_minutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

export default class FeedsTwitch extends AbstractService {
  async check_lives(channels: Array<ScheduledChannel>) {
    const totals = { checked: channels.length, live: 0, started: 0, ended: 0, failed: 0 };

    for (const batch of chunk(channels, MAX_STREAMS_PER_REQUEST)) {
      try {
        const streams = await useTwitch().streams.list({
          user_ids: batch.map((channel) => channel.service_id),
        });
        const streams_by_channel = new Map(streams.map((stream) => [stream.user_id, stream]));

        const data = batch.map((channel) => {
          const stream = streams_by_channel.get(channel.service_id);
          const live_ended = !!channel.live_stream_id && channel.live_stream_id !== stream?.id;

          totals.live += stream ? 1 : 0;
          totals.started += stream && stream.id !== channel.live_stream_id ? 1 : 0;
          totals.ended += live_ended ? 1 : 0;

          return {
            subscription_id: channel.subscription_id,
            next_check_at: next_live_check_at(
              stream?.started_at ?? channel.last_video_at,
              !!stream,
            ),
            live_stream_id: stream?.id ?? null,
            live_started_at: stream?.started_at ?? null,
            live_ended,
          };
        });

        await subscriptionsSync.record_live_checks({
          data,
          vods_delay_seconds: VODS_DELAY_SECONDS,
        });
      } catch (error) {
        totals.failed += batch.length;
        logger().error({ err: error, channels: batch.length }, "Failed to check Twitch lives");

        await Promise.all(
          batch.map((channel) =>
            subscriptionsSync.record_failure({
              subscription_id: channel.subscription_id,
              next_check_at: retry_at(channel.failures),
            }),
          ),
        );
      }
    }

    return totals;
  }

  async read_vods_due(channels: Array<VodsChannel>) {
    const totals = { read: channels.length, stored: 0, updated: 0, deleted: 0, failed: 0 };

    await async_pool(channels, 5, async (channel) => {
      try {
        const result = await this.read_vods(channel);
        totals.stored += result.stored;
        totals.updated += result.updated;
        totals.deleted += result.deleted;
      } catch (error) {
        totals.failed++;
        logger().error(
          { err: error, channel_id: channel.service_id, channel: channel.name },
          "Failed to read the VODs of a Twitch channel",
        );

        await subscriptionsSync.reschedule_vods({
          subscription_id: channel.subscription_id,
          vods_due_at: in_minutes(FAILURE_RETRY_MINUTES),
          last_video_at: null,
        });
      }
    });

    return totals;
  }

  async read_vods(channel: VodsChannel, options: Pick<SyncOptions, "full"> = { full: false }) {
    const stored = await videos.find_all_by_subscription({
      service: "twitch",
      subscription_id: channel.service_id,
    });
    const stored_by_id = new Map(stored.map((video) => [video.service_id, video]));

    const response = await useTwitch().videos.list({
      user_id: channel.service_id,
      first: options.full || stored.length === 0 ? FIRST_READ_SIZE : NEXT_READS_SIZE,
    });

    const finished = response.data.filter(
      (vod) => !channel.live_stream_id || vod.stream_id !== channel.live_stream_id,
    );
    const placeholders = finished.filter((vod) =>
      is_twitch_placeholder_thumbnail(vod.thumbnail_url),
    );
    const ready = finished.filter((vod) => !is_twitch_placeholder_thumbnail(vod.thumbnail_url));

    const created = ready.filter((vod) => !stored_by_id.has(vod.id));
    const known = ready.filter((vod) => stored_by_id.has(vod.id));

    const inserted = await withTransaction(async (tx) => {
      const inserted = await videos.insert_new({
        data: created.map((vod) => this.to_video(channel, vod)),
        options: { tx },
      });

      await pendingVideoImages.add_many({
        video_ids: inserted.map((video) => video.id),
        options: { tx },
      });

      return inserted;
    });

    await videos.update_metadata_many({
      data: known.map((vod) => ({
        id: stored_by_id.get(vod.id)!.id,
        title: vod.title,
        description: vod.description,
        duration: twitch_duration_seconds(vod.duration),
      })),
    });

    await videos.mark_checked({
      ids: response.data.flatMap((vod) => stored_by_id.get(vod.id)?.id ?? []),
    });

    const deleted = await this.remove_missing(stored, response.data);

    if (inserted.length > 0) {
      await services.search
        .index_guests({
          service: "twitch",
          channel_name: channel.name,
          videos: inserted.map((video) => ({ service_id: video.service_id, title: video.title })),
        })
        .catch((error: unknown) => {
          logger().error(
            { err: error, channel_id: channel.service_id },
            "Failed to index the guests of Twitch VODs",
          );
        });
    }

    const last_video_at = latest_date(response.data.map((vod) => vod.created_at));

    await subscriptionsSync.reschedule_vods({
      subscription_id: channel.subscription_id,
      vods_due_at:
        placeholders.length > 0
          ? in_minutes(PLACEHOLDER_RETRY_MINUTES)
          : next_vods_read_at(last_video_at),
      last_video_at,
    });

    logger().debug(
      {
        channel_id: channel.service_id,
        stored: inserted.length,
        updated: known.length,
        placeholders: placeholders.length,
        deleted,
      },
      "Twitch VODs read",
    );

    return { stored: inserted.length, updated: known.length, deleted };
  }

  async expire_due(max_batches = Infinity) {
    const totals = { checked: 0, deleted: 0, failed: 0 };

    for (let batch = 0; batch < max_batches; batch++) {
      const to_check = await videos.claim_to_check({
        service: "twitch",
        created_before: new Date(Date.now() - EXPIRY_MIN_AGE).toISOString(),
        checked_before: new Date(Date.now() - EXPIRY_CHECK_INTERVAL).toISOString(),
        limit: MAX_VIDEOS_PER_REQUEST,
      });

      if (to_check.length === 0) {
        break;
      }

      try {
        const result = await this.check(to_check);
        totals.checked += to_check.length;
        totals.deleted += result.deleted.length;
      } catch (error) {
        totals.failed += to_check.length;
        logger().error({ err: error, videos: to_check.length }, "Failed to check Twitch VODs");
      }

      if (to_check.length < MAX_VIDEOS_PER_REQUEST) {
        break;
      }
    }

    return totals;
  }

  async check(to_check: Array<CheckedVod>) {
    const found = await useTwitch().videos.list_by_ids({
      ids: to_check.map((video) => video.service_id),
    });

    return apply_videos_check("twitch", to_check, new Set(found.map((vod) => vod.id)));
  }

  private async remove_missing(
    stored: repositoryTypes.videos.FindAllBySubscriptionOutput,
    listed: Array<Vod>,
  ) {
    const oldest = listed.reduce<string | null>(
      (min, vod) => (!min || new Date(vod.created_at) < new Date(min) ? vod.created_at : min),
      null,
    );
    if (!oldest) {
      return 0;
    }

    const listed_ids = new Set(listed.map((vod) => vod.id));
    const missing = stored.filter(
      (video) =>
        !listed_ids.has(video.service_id) && new Date(video.created_at) >= new Date(oldest),
    );

    let deleted = 0;
    for (const batch of chunk(missing, MAX_VIDEOS_PER_REQUEST)) {
      deleted += (await this.check(batch)).deleted.length;
    }

    return deleted;
  }

  private to_video(channel: VodsChannel, vod: Vod): repositoryTypes.videos.InsertNewData {
    return {
      service: "twitch",
      service_id: vod.id,
      subscription_id: channel.service_id,
      title: vod.title,
      description: vod.description,
      created_at: vod.created_at,
      url: vod.url,
      duration: twitch_duration_seconds(vod.duration),
      thumbnail_small: twitch_thumbnail_url(vod.thumbnail_url, "small"),
      thumbnail_small_etag: "",
      thumbnail_large: "",
      thumbnail_large_source: twitch_thumbnail_url(vod.thumbnail_url, "large"),
      last_synced_at: new Date().toISOString(),
      ready_at: null,
      content_type: "live",
    };
  }

  async reconcile_eventsub() {
    const twitch = useTwitch();
    const callback = eventsub_callback();

    const existing: Array<Twitch["Eventsub"]["Subscription"]> = [];
    let max_total_cost = EVENTSUB_DEFAULT_MAX_COST;
    let cursor: string | undefined;
    do {
      const page = await twitch.eventsub.list({ type: EVENTSUB_TYPE, cursor });
      existing.push(...page.data);
      max_total_cost = page.max_total_cost || max_total_cost;
      cursor = page.pagination.cursor;
    } while (cursor);

    const wanted = new Set(
      await subscriptionsSync.find_most_followed({ service: "twitch", limit: max_total_cost }),
    );

    const healthy = existing.filter(
      (sub) =>
        EVENTSUB_HEALTHY.includes(sub.status) &&
        sub.transport.callback === callback &&
        wanted.has(sub.condition.broadcaster_user_id ?? ""),
    );
    const covered = new Set(healthy.map((sub) => sub.condition.broadcaster_user_id));
    const obsolete = existing
      .filter((sub) => !healthy.includes(sub))
      .slice(0, EVENTSUB_MAX_CHANGES);
    const missing = [...wanted]
      .filter((channel_id) => !covered.has(channel_id))
      .slice(0, EVENTSUB_MAX_CHANGES);

    const totals = { active: healthy.length, removed: 0, created: 0, failed: 0 };

    await async_pool(obsolete, 5, async (sub) => {
      try {
        await twitch.eventsub.remove({ id: sub.id });
        totals.removed++;
      } catch (error) {
        totals.failed++;
        logger().error(
          { err: error, subscription_id: sub.id },
          "Failed to remove an EventSub subscription",
        );
      }
    });

    await async_pool(missing, 5, async (channel_id) => {
      try {
        await twitch.eventsub.create({
          type: EVENTSUB_TYPE,
          broadcaster_user_id: channel_id,
          callback,
          secret: eventsub_secret(),
        });
        totals.created++;
      } catch (error) {
        totals.failed++;
        logger().error({ err: error, channel_id }, "Failed to create an EventSub subscription");
      }
    });

    return totals;
  }
}
