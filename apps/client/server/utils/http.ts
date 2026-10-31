// Outgoing requests to third parties (CDNs, APIs) must never hang a request or a sync forever
export const OUTGOING_REQUEST_TIMEOUT = 10_000; // 10 seconds, in ms

export const content_type_of = (response: Response) =>
  response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();

// Reads a whole body into memory, or returns `null` (and stops the download) above `max_size`.
// `content-length` may be missing or wrong: the limit is also enforced while reading.
export const read_body_with_limit = async (
  response: Response,
  max_size: number,
): Promise<Buffer | null> => {
  if (!response.body || Number(response.headers.get("content-length") ?? 0) > max_size) {
    await response.body?.cancel();
    return null;
  }

  const reader = response.body.getReader();
  const chunks: Array<Uint8Array> = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    size += value.byteLength;
    if (size > max_size) {
      await reader.cancel();
      return null;
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks);
};

// Streams a body without buffering it, and aborts the stream once more than `max_size` bytes
// went through. Returns `null` when `content-length` already announces a larger body.
export const stream_body_with_limit = (
  response: Response,
  max_size: number,
): ReadableStream<Uint8Array> | null => {
  if (!response.body || Number(response.headers.get("content-length") ?? 0) > max_size) {
    void response.body?.cancel();
    return null;
  }

  let size = 0;

  return response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        size += chunk.byteLength;
        if (size > max_size) {
          controller.error(new Error(`Upstream body is larger than ${max_size} bytes`));
          return;
        }

        controller.enqueue(chunk);
      },
    }),
  );
};
