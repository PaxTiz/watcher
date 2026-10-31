import { content_type_of, read_body_with_limit } from "#server/utils/http";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB, in bytes
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Maximum number of pixels sharp accepts to decode (the default is 268 million)
export const MAX_IMAGE_PIXELS = 4096 * 4096;

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
