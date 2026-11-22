import { credentials } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

import { useLogger } from "#framework";
import { services } from "#framework/server";
import { is_invalid_grant, SYNC_CREDENTIALS, type SyncService } from "#server/utils/sync";
import { next_subscriptions_sync_at, retry_at } from "#server/utils/sync_schedule";
import { async_pool } from "#shared/utils/random";

const BATCH_SIZE = 100;
const LEASE_SECONDS = 30 * 60;

const sync_due = async (service: SyncService) => {
  const logger = useLogger("tasks.subscriptions.sync");
  const credential = SYNC_CREDENTIALS[service];
  const started_at = Date.now();
  const totals = { synced: 0, invalid: 0, failed: 0 };

  const due = await credentials.claim_due_sync({
    service: credential,
    limit: BATCH_SIZE,
    lease_seconds: LEASE_SECONDS,
  });

  await async_pool(due, 5, async ({ user_id }) => {
    try {
      const user = await services.users.find_by_id(user_id);
      if (user) {
        await services.sync.subscriptions.sync(user, service);
      }

      totals.synced++;
      await credentials.reschedule_sync({
        service: credential,
        user_id,
        next_sync_at: next_subscriptions_sync_at(),
      });
    } catch (error) {
      if (is_invalid_grant(error)) {
        totals.invalid++;
        return;
      }

      totals.failed++;
      logger.error({ err: error, service, sync_user_id: user_id }, "Failed to sync subscriptions");

      await credentials.reschedule_sync({
        service: credential,
        user_id,
        next_sync_at: retry_at(2),
      });
    }
  });

  if (due.length > 0) {
    logger.info(
      { service, ...totals, duration_ms: Date.now() - started_at },
      "Subscriptions synced",
    );
  }

  return totals;
};

export default defineTask({
  meta: {
    name: "subscriptions:sync",
    description: "Sync the YouTube and Twitch channels followed by the users, once a day",
  },

  async run() {
    const youtube = await sync_due("youtube");
    const twitch = await sync_due("twitch");

    return { result: { youtube, twitch } };
  },
});
