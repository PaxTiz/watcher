import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";

const MAX_BATCHES = 20;

export default defineTask({
  meta: {
    name: "youtube:enrich",
    description: "Fetch the details of the pending YouTube videos and store them",
  },

  async run() {
    const started_at = Date.now();
    const totals = await services.feeds.youtube.enrich_pending(MAX_BATCHES);

    if (Object.values(totals).some((count) => count > 0)) {
      useLogger("tasks.youtube.enrich").info(
        { ...totals, duration_ms: Date.now() - started_at },
        "YouTube videos enriched",
      );
    }

    return { result: totals };
  },
});
