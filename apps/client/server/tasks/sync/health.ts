import { externalRequests, subscriptionsSync, videos } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { flush_external_requests } from "#server/lib/external_requests";
import { useTwitch } from "#server/lib/twitch";

const DAY = 24 * 60 * 60 * 1000;

const MAX_LAG_SECONDS = 60 * 60;
const MAX_FAILING_RATIO = 0.05;
const MIN_RATE_LIMIT_RATIO = 0.1;

// Every YouTube Data API call made costs 1 unit, failed ones included. The quota is per Google
// Cloud project and resets at midnight, Pacific time.
const YOUTUBE_DAILY_QUOTA = 10_000;
const MAX_YOUTUBE_QUOTA_RATIO = 0.8;
const YOUTUBE_QUOTA_PREFIX = "youtube.data.";

const pacific_hour = (date: Date) =>
  Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      hourCycle: "h23",
    }).format(date),
  );

const pacific_day_start = () => {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" })
    .format(new Date())
    .split("-")
    .map(Number);

  // Midnight in Los Angeles is 07:00 UTC (PDT) or 08:00 UTC (PST)
  const candidates = [7, 8].map((hour) => new Date(Date.UTC(year!, month! - 1, day!, hour)));

  return candidates.find((date) => pacific_hour(date) === 0)!.toISOString();
};

const HOUR = 60 * 60 * 1000;

// The stats are bucketed by hour and this task runs at the start of each hour
const previous_hour_start = () =>
  new Date((Math.floor(Date.now() / HOUR) - 1) * HOUR).toISOString();

const days_ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

export default defineTask({
  meta: {
    name: "sync:health",
    description: "Log the sync queues, external requests and quotas, warn when they fall behind",
  },

  async run() {
    await flush_external_requests();

    const [feeds, lives, unchecked_vods, last_hour_requests, youtube_day_requests] =
      await Promise.all([
        subscriptionsSync.stats({ service: "youtube" }),
        subscriptionsSync.stats({ service: "twitch" }),
        videos.count_unchecked({
          service: "twitch",
          created_before: days_ago(6),
          checked_before: days_ago(2),
        }),
        externalRequests.totals({ since: previous_hour_start() }),
        externalRequests.totals({ since: pacific_day_start() }),
      ]);

    const youtube_quota_used = youtube_day_requests
      .filter((row) => row.name.startsWith(YOUTUBE_QUOTA_PREFIX))
      .reduce((total, row) => total + row.requests, 0);

    const requests = Object.fromEntries(
      last_hour_requests.map(({ name, ...counts }) => [name, counts]),
    );

    const twitch = useTwitch();
    const rate_limit = {
      limit: twitch.rate_limit?.limit ?? null,
      lowest_remaining: twitch.take_lowest_remaining(),
    };

    const ratio = (count: number, total: number) => (total > 0 ? count / total : 0);
    const feeds_failing = ratio(feeds.failing, feeds.scheduled);
    const lives_failing = ratio(lives.failing, lives.scheduled);

    const alerts = [
      feeds.lag_seconds > MAX_LAG_SECONDS && "youtube_feeds_lagging",
      feeds_failing > MAX_FAILING_RATIO && "youtube_feeds_failing",
      lives.lag_seconds > MAX_LAG_SECONDS && "twitch_lives_lagging",
      lives_failing > MAX_FAILING_RATIO && "twitch_lives_failing",
      unchecked_vods > 0 && "twitch_expire_lagging",
      rate_limit.limit !== null &&
        rate_limit.lowest_remaining !== null &&
        rate_limit.lowest_remaining < rate_limit.limit * MIN_RATE_LIMIT_RATIO &&
        "twitch_rate_limited",
      youtube_quota_used > YOUTUBE_DAILY_QUOTA * MAX_YOUTUBE_QUOTA_RATIO && "youtube_quota_low",
    ].filter(Boolean);

    const result = {
      youtube: {
        feeds: { ...feeds, failing_ratio: feeds_failing },
        quota: { used: youtube_quota_used, limit: YOUTUBE_DAILY_QUOTA },
      },
      twitch: { lives: { ...lives, failing_ratio: lives_failing }, unchecked_vods, rate_limit },
      requests,
      alerts,
    };
    const logger = useLogger("tasks.sync.health");

    if (alerts.length > 0) {
      logger.warn(result, "Sync falling behind");
    } else {
      logger.info(result, "Sync healthy");
    }

    return { result };
  },
});
