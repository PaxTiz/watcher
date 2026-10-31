import { createError, type RequestEvent } from "nuxt/server";

import type { User } from "#auth-utils";
import { useRateLimiter } from "#server/lib/rate_limiter";

export const guard_subscriptions_sync = async <T>(
  event: RequestEvent,
  user: User,
  run: () => Promise<T>,
): Promise<T> => {
  const lock = useRateLimiter("subscriptions_sync_lock");

  if (!(await lock.increment(user.id)).is_valid) {
    throw createError({ status: 409, message: "sync_in_progress" });
  }

  try {
    await useRateLimiter("subscriptions_sync").consume(event, user.id);

    return await run();
  } finally {
    await lock.reset(user.id);
  }
};
