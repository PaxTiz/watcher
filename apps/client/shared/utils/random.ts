import { z } from "zod/mini";

export const randomId = (size = 16) => {
  return crypto.getRandomValues(new Uint32Array(size / 8)).join("");
};

export const is_uuid = (value: string) => {
  return z.uuidv7().safeParse(value).success;
};

export const parse_slug_params = (value: string) => {
  if (z.string().check(z.regex(/(.*),(.*)/))) {
    return value.replaceAll(",", "/");
  }

  return value;
};

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type Limiter = <T>(task: () => Promise<T>) => Promise<T>;

export const create_limiter = (max: number, min_interval_ms = 0): Limiter => {
  let active = 0;
  let next_start = 0;
  const waiting: Array<() => void> = [];

  const wait_interval = async () => {
    if (min_interval_ms === 0) {
      return;
    }

    const now = Date.now();
    const start = Math.max(now, next_start);
    next_start = start + min_interval_ms;

    if (start > now) {
      await sleep(start - now);
    }
  };

  return async (task) => {
    if (active < max) {
      active++;
    } else {
      await new Promise<void>((resolve) => waiting.push(resolve));
    }

    try {
      await wait_interval();
      return await task();
    } finally {
      const next = waiting.shift();
      if (next) {
        next();
      } else {
        active--;
      }
    }
  };
};

export const async_pool = async <T>(
  items: Array<T>,
  count: number,
  callback: (item: T) => Promise<unknown>,
) => {
  const limit = create_limiter(count);

  await Promise.allSettled(items.map((item) => limit(() => callback(item))));
};

export const with_retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  base_delay_ms = 1000,
): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries) throw error;
      await sleep(base_delay_ms * 2 ** attempt);
    }
  }
};
