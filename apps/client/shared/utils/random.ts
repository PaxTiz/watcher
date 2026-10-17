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

export const async_pool = async <T>(
  items: Array<T>,
  count: number,
  callback: (item: T) => Promise<unknown>,
) => {
  for (let i = 0; i < items.length; i += count) {
    const sub_items = items.slice(i, i + count);
    const promises = sub_items.map(callback);
    await Promise.all(promises);
  }
};

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const async_pool_with_delay = async <T>(
  items: Array<T>,
  count: number,
  delay_ms: number,
  callback: (item: T) => Promise<unknown>,
) => {
  for (let i = 0; i < items.length; i += count) {
    const sub_items = items.slice(i, i + count);
    await Promise.all(sub_items.map(callback));

    if (i + count < items.length) {
      await sleep(delay_ms);
    }
  }
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
