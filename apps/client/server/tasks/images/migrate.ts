import { readdir, readFile, unlink } from "node:fs/promises";
import { basename, extname, join } from "node:path";

import { defineTask } from "nitropack/runtime";
import { useRuntimeConfig } from "nuxt/server";

import { UPLOADS_DIRECTORY, useImagesStorage } from "#server/lib/images_storage";
import { type ImageSize, sync_image, write_image } from "#server/utils/images";
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

// Small YouTube thumbnails used to be downloaded from `mqdefault` (320x180): the sync now uses
// `hqdefault`, but YouTube answers 304 with the ETag of the previous one, so they're downloaded here
const download_youtube_thumbnail = async (path: string) => {
  const video_id = basename(path).slice(0, -"_small".length);

  const thumbnail = await sync_image({
    url: `https://i.ytimg.com/vi/${video_id}/hqdefault.jpg`,
    path,
    size: "small",
    current: { path: "", etag: null },
  });

  return thumbnail !== null;
};

// JPEG images downloaded before the conversion to AVIF and WebP
const migrate_jpeg_images = async (files: Array<string>) => {
  const result = { downloaded: 0, converted: 0, removed: 0, failed: 0 };
  const images = files.filter((file) => file.endsWith(".jpg"));

  await async_pool(images, 10, async (file) => {
    const source = join(UPLOADS_DIRECTORY, file);
    const path = `/${file.slice(0, -".jpg".length)}`;
    const size = size_of(path);

    // Large thumbnails are generated again the first time they're displayed
    if (!size) {
      await unlink(source);
      result.removed++;
      return;
    }

    if (
      size === "small" &&
      file.startsWith("youtube/") &&
      (await download_youtube_thumbnail(path))
    ) {
      result.downloaded++;
    } else if (await write_image(await readFile(source), path, size)) {
      result.converted++;
    } else {
      result.failed++;
      return;
    }

    await unlink(source);
  });

  return result;
};

// AVIF images already stored on the disk, when moving to the `s3` driver
const upload_local_images = async (files: Array<string>) => {
  const result = { uploaded: 0, failed: 0 };
  if (useRuntimeConfig().images.driver === "filesystem") {
    return result;
  }

  const images = files.filter((file) => extname(file) === ".avif");

  await async_pool(images, 10, async (file) => {
    try {
      const body = await readFile(join(UPLOADS_DIRECTORY, file));
      await useImagesStorage().put(file, body, "image/avif");
      result.uploaded++;
    } catch {
      result.failed++;
    }
  });

  return result;
};

// Images used to be stored as WebP too: they're removed from the disk and from the storage
const remove_webp_images = async (files: Array<string>) => {
  const result = { removed: 0, failed: 0 };
  const images = files.filter((file) => extname(file) === ".webp");

  await async_pool(images, 10, async (file) => {
    try {
      await useImagesStorage().remove(file);
      await unlink(join(UPLOADS_DIRECTORY, file)).catch(() => {});
      result.removed++;
    } catch {
      result.failed++;
    }
  });

  return result;
};

export default defineTask({
  meta: {
    name: "images:migrate",
    description:
      "Move the images of the disk to the configured storage: JPEG images are converted to AVIF (small YouTube thumbnails are downloaded again at 480x270), and large thumbnails and WebP images are removed",
  },

  async run() {
    const files = await readdir(UPLOADS_DIRECTORY, { recursive: true }).catch(() => []);

    const uploaded = await upload_local_images(files);
    const webp = await remove_webp_images(files);
    const jpeg = await migrate_jpeg_images(files);

    return { result: { ...uploaded, webp, jpeg } };
  },
});
