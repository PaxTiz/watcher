import { subscriptionsSync, videos } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { useTwitch } from "#server/lib/twitch";

const DAY = 24 * 60 * 60 * 1000;

const MAX_LAG_SECONDS = 60 * 60;
const MAX_FAILING_RATIO = 0.05;
const MIN_RATE_LIMIT_RATIO = 0.1;

const days_ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

export default defineTask({
  meta: {
    name: "sync:health",
    description: "Log the lag and size of the sync queues, warn when they fall behind",
  },

  async run() {
    const [feeds, lives, unchecked_vods] = await Promise.all([
      subscriptionsSync.stats({ service: "youtube" }),
      subscriptionsSync.stats({ service: "twitch" }),
      videos.count_unchecked({
        service: "twitch",
        created_before: days_ago(6),
        checked_before: days_ago(2),
      }),
    ]);

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
    ].filter(Boolean);

    const result = {
      youtube: { feeds: { ...feeds, failing_ratio: feeds_failing } },
      twitch: { lives: { ...lives, failing_ratio: lives_failing }, unchecked_vods, rate_limit },
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
