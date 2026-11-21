import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";
import { eventsub_enabled } from "#server/utils/eventsub";

export default defineTask({
  meta: {
    name: "twitch:eventsub",
    description: "Subscribe the most followed Twitch channels to EventSub, remove the stale ones",
  },

  async run() {
    if (!eventsub_enabled()) {
      return {};
    }

    const started_at = Date.now();
    const totals = await services.feeds.twitch.reconcile_eventsub();

    useLogger("tasks.twitch.eventsub").info(
      { ...totals, duration_ms: Date.now() - started_at },
      "Twitch EventSub subscriptions reconciled",
    );

    return { result: totals };
  },
});
