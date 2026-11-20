import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";

const MAX_BATCHES = 10;

export default defineTask({
  meta: {
    name: "videos:images",
    description: "Process the thumbnail of the new videos, which are hidden until then",
  },

  async run() {
    const started_at = Date.now();
    const totals = await services.feeds.images.process_pending(MAX_BATCHES);

    if (Object.values(totals).some((count) => count > 0)) {
      useLogger("tasks.videos.images").info(
        { ...totals, duration_ms: Date.now() - started_at },
        "Video thumbnails processed",
      );
    }

    return { result: totals };
  },
});
