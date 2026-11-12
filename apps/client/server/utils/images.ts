import { mkdir, stat, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";

import { request_options } from "@watcher/common";
import { ofetch } from "ofetch";
import sharp, { type AvifOptions, type WebpOptions } from "sharp";

import { useLogger } from "#framework";
import { content_type_of, read_body_with_limit } from "#server/utils/http";

export const UPLOADS_DIRECTORY = join(process.cwd(), ".storage", "uploads");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB, in bytes
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Stored for images served without an ETag, as the column can't be null
export const INVALID_ETAG = "__INVALID_ETAG__";

// Maximum number of pixels sharp accepts to decode (the default is 268 million)
export const MAX_IMAGE_PIXELS = 4096 * 4096;

export const IMAGE_FORMATS = ["avif", "webp"] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

const IMAGE_ENCODERS = {
  avif: { quality: 55, effort: 4 },
  webp: { quality: 80 },
} satisfies Record<ImageFormat, AvifOptions | WebpOptions>;

export const IMAGE_SIZES = {
  logo: { width: 192, height: 192 },
  small: { width: 480, height: 270 },
  large: { width: 700, height: 394 },
} as const;
export type ImageSize = keyof typeof IMAGE_SIZES;

export const public_image_url = (path: string) => (path ? `/uploads${path}` : "");

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

  const file = await stat(join(UPLOADS_DIRECTORY, `${local_path}.webp`)).catch(() => null);

  return file ? { "If-Modified-Since": file.mtime.toUTCString() } : {};
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

// Resizes `image` to `size`, and writes it at `path` in every format. Returns `false` if sharp can't decode it.
export const write_image = async (image: Buffer, path: string, size: ImageSize) => {
  const target = join(UPLOADS_DIRECTORY, path);

  try {
    await mkdir(dirname(target), { recursive: true });

    const resized = sharp(image, { limitInputPixels: MAX_IMAGE_PIXELS }).resize({
      ...IMAGE_SIZES[size],
      fit: "cover",
      withoutEnlargement: true,
    });

    await Promise.all(
      IMAGE_FORMATS.map((format) =>
        resized.clone().toFormat(format, IMAGE_ENCODERS[format]).toFile(`${target}.${format}`),
      ),
    );

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

  await Promise.allSettled(
    IMAGE_FORMATS.map((format) => unlink(join(UPLOADS_DIRECTORY, `${path}.${format}`))),
  );
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
