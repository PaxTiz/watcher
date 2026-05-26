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
