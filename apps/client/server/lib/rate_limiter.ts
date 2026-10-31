import { rateLimits } from "@watcher/database";
import { createError, getRequestIP, type RequestEvent } from "nuxt/server";

const RATE_LIMITS = {
  subscriptions_sync: { attempts: 2, ttl: 3600 },

  subscriptions_sync_lock: { attempts: 1, ttl: 3600 },

  passkeys_authenticate: { attempts: 20, ttl: 60 },

  passkeys_register: { attempts: 10, ttl: 3600 },

  oauth: { attempts: 20, ttl: 60 },

  video_url: { attempts: 60, ttl: 60 },
} as const satisfies Record<string, { attempts: number; ttl: number }>;

export type RateLimitType = keyof typeof RATE_LIMITS;

export type RateLimitState = {
  is_valid: boolean;
  limit: number;
  remaining: number;
  reset_at: Date;
  reset_in: number; // in seconds
};

const seconds_until = (date: Date) => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));

export const useRateLimiter = (type: RateLimitType) => {
  const { attempts: limit, ttl } = RATE_LIMITS[type];

  const increment = async (key: string): Promise<RateLimitState> => {
    const { attempts, expires_at } = await rateLimits.increment({ type, key, ttl });

    return {
      is_valid: attempts <= limit,
      limit,
      remaining: Math.max(0, limit - attempts),
      reset_at: new Date(expires_at),
      reset_in: seconds_until(new Date(expires_at)),
    };
  };

  const is_valid = async (key: string) => {
    const row = await rateLimits.find({ type, key });

    return !row || row.attempts <= limit;
  };

  const reset = (key: string) => rateLimits.remove({ type, key });

  const set_headers = (event: RequestEvent, state: RateLimitState) => {
    event.res.headers.set("RateLimit-Limit", state.limit.toString());
    event.res.headers.set("RateLimit-Remaining", state.remaining.toString());
    event.res.headers.set("RateLimit-Reset", state.reset_in.toString());

    if (!state.is_valid) {
      event.res.headers.set("Retry-After", state.reset_in.toString());
    }
  };

  const consume = async (event: RequestEvent, key: string) => {
    const state = await increment(key);
    set_headers(event, state);

    if (!state.is_valid) {
      throw createError({
        status: 429,
        message: "too_many_attempts",
        data: { retry_after: state.reset_in },
      });
    }

    return state;
  };

  return { increment, is_valid, reset, set_headers, consume };
};

export const get_client_ip = (event: RequestEvent) =>
  getRequestIP(event, { xForwardedFor: true }) ?? null;
