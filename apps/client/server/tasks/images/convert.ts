import { readdir, readFile, unlink } from "node:fs/promises";
import { basename, join } from "node:path";

import { defineTask } from "nitropack/runtime";

import { type ImageSize, sync_image, UPLOADS_DIRECTORY, write_image } from "#server/utils/images";
import { async_pool } from "#shared/utils/random";

const size_of = (path: string): ImageSize | null => {
  if (path.endsWith("_small")) {
    return "small";
  }

  if (path.endsWith("/logo")) {
    return "logo";
  }

  return null;
};

const convert_jpeg_images = async (files: Array<string>) => {
  const result = { converted: 0, removed: 0, failed: 0 };
  const images = files.filter((file) => file.endsWith(".jpg"));

  await async_pool(images, 10, async (file) => {
    const source = join(UPLOADS_DIRECTORY, file);
    const path = `/${file.slice(0, -".jpg".length)}`;
    const size = size_of(path);

    // Large thumbnails are generated again the first time they're displayed
    if (size && !(await write_image(await readFile(source), path, size))) {
      result.failed++;
      return;
    }

    await unlink(source);

    if (size) {
      result.converted++;
    } else {
      result.removed++;
    }
  });

  return result;
};

// Small YouTube thumbnails used to be downloaded from `mqdefault` (320x180): the sync now uses
// `hqdefault`, but YouTube answers 304 with the ETag of the previous one, so they're downloaded here.
// The converted thumbnail is kept when the download fails.
const refresh_youtube_thumbnails = async (files: Array<string>) => {
  const result = { refreshed: 0, failed: 0 };
  const thumbnails = files.filter(
    (file) => file.startsWith("youtube/") && file.endsWith("_small.webp"),
  );

  await async_pool(thumbnails, 10, async (file) => {
    const path = `/${file.slice(0, -".webp".length)}`;
    const video_id = basename(path).slice(0, -"_small".length);

    const thumbnail = await sync_image({
      url: `https://i.ytimg.com/vi/${video_id}/hqdefault.jpg`,
      path,
      size: "small",
      current: { path: "", etag: null },
    });

    if (thumbnail) {
      result.refreshed++;
    } else {
      result.failed++;
    }
  });

  return result;
};

export default defineTask({
  meta: {
    name: "images:convert",
    description:
      "Convert the downloaded JPEG logos and thumbnails to AVIF and WebP, remove the large thumbnails, and download the small YouTube thumbnails again at 480x270",
  },

  async run() {
    const converted = await convert_jpeg_images(
      await readdir(UPLOADS_DIRECTORY, { recursive: true }),
    );

    const refreshed = await refresh_youtube_thumbnails(
      await readdir(UPLOADS_DIRECTORY, { recursive: true }),
    );

    return { result: { ...converted, youtube: refreshed } };
  },
});
