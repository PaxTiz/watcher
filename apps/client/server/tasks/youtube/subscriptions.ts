import { credentials } from "@watcher/database";
import { GoogleInvalidGrantError } from "@watcher/integration-google";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";
import { next_subscriptions_sync_at, retry_at } from "#server/utils/sync_schedule";
import { async_pool } from "#shared/utils/random";

const BATCH_SIZE = 100;
const LEASE_SECONDS = 30 * 60;

export default defineTask({
  meta: {
    name: "youtube:subscriptions",
    description: "Sync the YouTube channels followed by the users, once a day",
  },

  async run() {
    const logger = useLogger("tasks.youtube.subscriptions");
    const started_at = Date.now();
    const totals = { synced: 0, invalid: 0, failed: 0 };

    const due = await credentials.claim_due_sync({
      service: "google",
      limit: BATCH_SIZE,
      lease_seconds: LEASE_SECONDS,
    });

    await async_pool(due, 5, async ({ user_id }) => {
      try {
        const user = await services.users.find_by_id(user_id);
        if (user) {
          await services.sync.youtube.sync_subscriptions(user);
        }

        totals.synced++;
        await credentials.reschedule_sync({
          service: "google",
          user_id,
          next_sync_at: next_subscriptions_sync_at(),
        });
      } catch (error) {
        if (error instanceof GoogleInvalidGrantError) {
          totals.invalid++;
          return;
        }

        totals.failed++;
        logger.error({ err: error, sync_user_id: user_id }, "Failed to sync YouTube subscriptions");

        await credentials.reschedule_sync({
          service: "google",
          user_id,
          next_sync_at: retry_at(2),
        });
      }
    });

    if (due.length > 0) {
      logger.info(
        { ...totals, duration_ms: Date.now() - started_at },
        "YouTube subscriptions synced",
      );
    }

    return { result: totals };
  },
});
