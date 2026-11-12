import { createError, type RequestEvent } from "nuxt/server";

import type { User } from "#auth-utils";
import { useLogger } from "#framework";
import { useRateLimiter } from "#server/lib/rate_limiter";

export const guard_subscriptions_sync = async <T>(
  event: RequestEvent,
  user: User,
  run: () => Promise<T>,
): Promise<T> => {
  const lock = useRateLimiter("subscriptions_sync_lock");

  if (!(await lock.increment(user.id)).is_valid) {
    useLogger("server.utils.sync").warn("Sync refused: another one is in progress");
    throw createError({ status: 409, message: "sync_in_progress" });
  }

  try {
    await useRateLimiter("subscriptions_sync").consume(event, user.id);

    return await run();
  } finally {
    await lock.reset(user.id);
  }
};

export const count_by_status = (items: Array<{ status: "created" | "updated" | "deleted" }>) => {
  const counts = { created: 0, updated: 0, deleted: 0 };

  for (const { status } of items) {
    counts[status]++;
  }

  return counts;
};
