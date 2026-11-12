import { request_options } from "@watcher/common";
import { ofetch } from "ofetch";
import sharp, { type AvifOptions } from "sharp";

import { useLogger } from "#framework";
import { useImagesStorage } from "#server/lib/images_storage";
import { content_type_of, read_body_with_limit } from "#server/utils/http";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB, in bytes
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Stored for images served without an ETag, as the column can't be null
export const INVALID_ETAG = "__INVALID_ETAG__";

// Maximum number of pixels sharp accepts to decode (the default is 268 million)
export const MAX_IMAGE_PIXELS = 4096 * 4096;

const IMAGE_ENCODER: AvifOptions = { quality: 55, effort: 4 };

export const IMAGE_SIZES = {
  logo: { width: 192, height: 192 },
  small: { width: 480, height: 270 },
  large: { width: 700, height: 394 },
} as const;
export type ImageSize = keyof typeof IMAGE_SIZES;

const key_of = (path: string) => `${path.slice(1)}.avif`;

export const public_image_url = (path: string) =>
  path ? useImagesStorage().public_url(key_of(path)) : "";

export const read_image = (path: string) => useImagesStorage().get(key_of(path));

const conditional_headers = async (
  etag: string | null,
  local_path: string,
): Promise<Record<string, string>> => {
  if (etag && etag !== INVALID_ETAG) {
    return { "If-None-Match": etag };
  }

  if (!local_path) {
    return {};
  }

  const last_modified = await useImagesStorage()
    .last_modified(key_of(local_path))
    .catch(() => null);

  return last_modified ? { "If-Modified-Since": last_modified.toUTCString() } : {};
};

// Reads a downloaded logo or thumbnail, before it reaches sharp.
// Returns `null` for an error, an unexpected content type, or an image above `MAX_IMAGE_SIZE`.
const read_image_response = async (response: Response): Promise<Buffer | null> => {
  const type = content_type_of(response);

  if (!response.ok || !type || !IMAGE_TYPES.includes(type)) {
    await response.body?.cancel();
    return null;
  }

  return read_body_with_limit(response, MAX_IMAGE_SIZE);
};

// Resizes `image` to `size`, and stores it at `path`.
// Returns `false` if sharp can't decode it, or if the storage fails.
export const write_image = async (image: Buffer, path: string, size: ImageSize) => {
  try {
    const resized = await sharp(image, { limitInputPixels: MAX_IMAGE_PIXELS })
      .resize({ ...IMAGE_SIZES[size], fit: "cover", withoutEnlargement: true })
      .avif(IMAGE_ENCODER)
      .toBuffer();

    await useImagesStorage().put(key_of(path), resized, "image/avif");

    return true;
  } catch (error) {
    useLogger("server.utils.images").warn({ err: error, path }, "Failed to write image");
    return false;
  }
};

export const remove_image = async (path: string) => {
  if (!path) {
    return;
  }

  await useImagesStorage()
    .remove(key_of(path))
    .catch(() => {});
};

type SyncImageInput = {
  url: string;
  path: string; // where to write the image
  size: ImageSize;
  current: { path: string; etag: string | null }; // the last download, for conditional requests
};

// Downloads `url` and writes it at `path`, unless it didn't change since the last download.
// Returns the original image (before resizing), or `null` when nothing was written.
export const sync_image = async ({
  url,
  path,
  size,
  current,
}: SyncImageInput): Promise<{ image: Buffer; etag: string } | null> => {
  if (!url) {
    return null;
  }

  const response = await ofetch
    .raw(url, {
      ...request_options(),
      responseType: "stream",
      headers: await conditional_headers(current.etag, current.path),
    })
    .catch(() => null);

  if (!response || response.status === 304) {
    return null;
  }

  const image = await read_image_response(response);
  if (!image || !(await write_image(image, path, size))) {
    return null;
  }

  return { image, etag: response.headers.get("etag") ?? INVALID_ETAG };
};
