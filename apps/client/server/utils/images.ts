import { stat } from "node:fs/promises";
import { join } from "node:path";

import { content_type_of, read_body_with_limit } from "#server/utils/http";

const UPLOADS_DIRECTORY = join(process.cwd(), ".storage", "uploads");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB, in bytes
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Stored for images served without an ETag, as the column can't be null
export const INVALID_ETAG = "__INVALID_ETAG__";

// Maximum number of pixels sharp accepts to decode (the default is 268 million)
export const MAX_IMAGE_PIXELS = 4096 * 4096;

export const conditional_headers = async (
  etag: string | null,
  local_path: string,
): Promise<Record<string, string>> => {
  if (etag && etag !== INVALID_ETAG) {
    return { "If-None-Match": etag };
  }

  if (!local_path) {
    return {};
  }

  const file = await stat(join(UPLOADS_DIRECTORY, local_path)).catch(() => null);

  return file ? { "If-Modified-Since": file.mtime.toUTCString() } : {};
};

// Reads a downloaded logo or thumbnail, before it reaches the disk (then IPX and sharp).
// Returns `null` for an error, an unexpected content type, or an image above `MAX_IMAGE_SIZE`.
export const read_image_response = async (response: Response): Promise<Buffer | null> => {
  const type = content_type_of(response);

  if (!response.ok || !type || !IMAGE_TYPES.includes(type)) {
    await response.body?.cancel();
    return null;
  }

  return read_body_with_limit(response, MAX_IMAGE_SIZE);
};
