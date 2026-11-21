import { type repositoryTypes, subscriptionsSync } from "@watcher/database";
import { MAX_STREAMS_PER_REQUEST } from "@watcher/integration-twitch";

import { AbstractService, useLogger } from "#framework";
import { useTwitch } from "#server/lib/twitch";
import { next_live_check_at, retry_at } from "#server/utils/sync_schedule";

const logger = () => useLogger("services.feeds.twitch");

type ScheduledChannel = repositoryTypes.subscriptionsSync.ClaimDueOutput[number];

const chunk = <T>(items: Array<T>, size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );

const VODS_DELAY_SECONDS = 10 * 60;

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
}
