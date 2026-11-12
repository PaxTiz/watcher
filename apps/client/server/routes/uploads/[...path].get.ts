import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

import { createError, defineEventHandler, getRouterParam } from "nuxt/server";

import { UPLOADS_DIRECTORY } from "#server/utils/images";

const CACHE_MAX_AGE = 3600 * 12; // 12 hours, in seconds

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".webp": "image/webp",
};

export default defineEventHandler(async (event) => {
  const path = normalize(`/${getRouterParam(event, "path") ?? ""}`);
  const content_type = CONTENT_TYPES[extname(path)];

  if (!content_type) {
    throw createError({ status: 404 });
  }

  const file = join(UPLOADS_DIRECTORY, path);
  const stats = await stat(file).catch(() => null);

  if (!stats?.isFile()) {
    throw createError({ status: 404 });
  }

  event.res.headers.set("Content-Type", content_type);
  event.res.headers.set("Content-Length", stats.size.toString());
  event.res.headers.set("Last-Modified", stats.mtime.toUTCString());
  event.res.headers.set("Cache-Control", `public, max-age=${CACHE_MAX_AGE}`);

  return readFile(file);
});
