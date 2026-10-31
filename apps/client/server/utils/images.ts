const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB, in bytes
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Maximum number of pixels sharp accepts to decode (the default is 268 million)
export const MAX_IMAGE_PIXELS = 4096 * 4096;

// Reads a downloaded logo or thumbnail, before it reaches the disk (then IPX and sharp).
// Returns `null` for an error, an unexpected content type, or an image above `MAX_IMAGE_SIZE`.
export const read_image_response = async (response: Response): Promise<Buffer | null> => {
  const type = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  const length = Number(response.headers.get("content-length") ?? 0);

  if (!response.ok || !response.body || !type || !IMAGE_TYPES.includes(type)) {
    await response.body?.cancel();
    return null;
  }

  if (length > MAX_IMAGE_SIZE) {
    await response.body.cancel();
    return null;
  }

  // `content-length` may be missing or wrong: the limit is also enforced while reading
  const reader = response.body.getReader();
  const chunks: Array<Uint8Array> = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    size += value.byteLength;
    if (size > MAX_IMAGE_SIZE) {
      await reader.cancel();
      return null;
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks);
};
