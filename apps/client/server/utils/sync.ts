import { userSyncs } from "@watcher/database";
import { GoogleInvalidGrantError } from "@watcher/integration-google";
import { createError, type RequestEvent } from "nuxt/server";

import type { User } from "#auth-utils";
import { useLogger } from "#framework";
import { useRateLimiter } from "#server/lib/rate_limiter";

export const SYNC_STALE_AFTER_SECONDS = 30 * 60;

export type SyncOptions = { full: boolean };

export const is_sync_running = (state: { started_at: string; finished_at: string | null }) =>
  !state.finished_at &&
  Date.now() - new Date(state.started_at).getTime() < SYNC_STALE_AFTER_SECONDS * 1000;

export const start_subscriptions_sync = async (
  event: RequestEvent,
  user: User,
  run: () => Promise<unknown>,
) => {
  const logger = useLogger("server.utils.sync");

  const state = await userSyncs.find({ user_id: user.id });
  if (state && is_sync_running(state)) {
    logger.warn("Sync refused: another one is in progress");
    throw createError({ status: 409, message: "sync_in_progress" });
  }

  await useRateLimiter("subscriptions_sync").consume(event, user.id);

  if (
    !(await userSyncs.start({ user_id: user.id, stale_after_seconds: SYNC_STALE_AFTER_SECONDS }))
  ) {
    logger.warn("Sync refused: another one is in progress");
    throw createError({ status: 409, message: "sync_in_progress" });
  }

  void run()
    .then(() => userSyncs.finish({ user_id: user.id, error: null }))
    .catch(async (error: unknown) => {
      logger.error({ err: error }, "Subscriptions sync failed");

      await userSyncs.finish({
        user_id: user.id,
        error: error instanceof GoogleInvalidGrantError ? "integration_invalid" : "sync_failed",
      });
    });

  event.res.status = 202;
};

export const count_by_status = (items: Array<{ status: "created" | "updated" | "deleted" }>) => {
  const counts = { created: 0, updated: 0, deleted: 0 };

  for (const { status } of items) {
    counts[status]++;
  }

  return counts;
};
