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
