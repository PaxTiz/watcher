import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
  type StorageClass,
} from "@aws-sdk/client-s3";
import { useRuntimeConfig } from "nuxt/server";

import { useLogger } from "#framework";
import { create_limiter } from "#shared/utils/random";

// Where the `filesystem` driver stores images, served by the `/uploads` route
export const UPLOADS_DIRECTORY = join(process.cwd(), ".storage", "uploads");

// Images are overwritten in place when a thumbnail or a logo changes
const CACHE_CONTROL = "public, max-age=43200"; // 12 hours

// Keys are relative paths, like `youtube/channels/<id>/logo.avif`
export type ImagesStorage = {
  put: (key: string, body: Buffer, content_type: string) => Promise<void>;
  get: (key: string) => Promise<Buffer | null>;
  last_modified: (key: string) => Promise<Date | null>;
  remove: (key: string) => Promise<void>;
  public_url: (key: string) => string;
};

const filesystem_storage = (): ImagesStorage => ({
  async put(key, body) {
    const file = join(UPLOADS_DIRECTORY, key);

    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, body);
  },

  get: (key) => readFile(join(UPLOADS_DIRECTORY, key)).catch(() => null),

  last_modified: async (key) => {
    const file = await stat(join(UPLOADS_DIRECTORY, key)).catch(() => null);

    return file?.mtime ?? null;
  },

  async remove(key) {
    await unlink(join(UPLOADS_DIRECTORY, key)).catch(() => {});
  },

  public_url: (key) => `/uploads/${key}`,
});

const MAX_CONCURRENT_REQUESTS = 16;

const is_not_found = (error: unknown) =>
  error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404;

// Only uses the core of the S3 API (no ACL: public read access is configured on the bucket),
// to work with any provider: Scaleway, Cloudflare R2, Garage, MinIO...
const s3_storage = (): ImagesStorage => {
  const { publicUrl, s3 } = useRuntimeConfig().images;
  const Bucket = s3.bucket;
  const StorageClass = (s3.storageClass || undefined) as StorageClass | undefined;

  const client = new S3Client({
    endpoint: s3.endpoint,
    region: s3.region,
    forcePathStyle: s3.forcePathStyle,
    credentials: { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey },

    // The default checksums aren't supported by every S3-compatible provider
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  const limit = create_limiter(MAX_CONCURRENT_REQUESTS);

  // Logs the failures of the S3 requests, with what the provider answered
  const send = async <T>(operation: string, Key: string, request: () => Promise<T>) => {
    try {
      return await request();
    } catch (error) {
      if (!is_not_found(error)) {
        useLogger("server.lib.images_storage").error(
          {
            err: error,
            operation,
            key: Key,
            bucket: Bucket,
            status:
              error instanceof S3ServiceException ? error.$metadata.httpStatusCode : undefined,
          },
          "S3 request failed",
        );
      }

      throw error;
    }
  };

  useLogger("server.lib.images_storage").info(
    { endpoint: s3.endpoint, region: s3.region, bucket: Bucket, storage_class: StorageClass },
    "S3 images storage initialized",
  );

  return {
    put: (Key, Body, ContentType) =>
      limit(async () => {
        await send("put", Key, () =>
          client.send(
            new PutObjectCommand({
              Bucket,
              Key,
              Body,
              ContentType,
              CacheControl: CACHE_CONTROL,
              StorageClass,
            }),
          ),
        );
      }),

    get: (Key) =>
      limit(async () => {
        try {
          const object = await send("get", Key, () =>
            client.send(new GetObjectCommand({ Bucket, Key })),
          );
          const body = await object.Body?.transformToByteArray();

          return body ? Buffer.from(body) : null;
        } catch (error) {
          if (is_not_found(error)) {
            return null;
          }

          throw error;
        }
      }),

    last_modified: (Key) =>
      limit(async () => {
        try {
          const object = await send("head", Key, () =>
            client.send(new HeadObjectCommand({ Bucket, Key })),
          );

          return object.LastModified ?? null;
        } catch (error) {
          if (is_not_found(error)) {
            return null;
          }

          throw error;
        }
      }),

    remove: (Key) =>
      limit(async () => {
        await send("delete", Key, () => client.send(new DeleteObjectCommand({ Bucket, Key })));
      }),

    public_url: (key) => `${publicUrl.replace(/\/$/, "")}/${key}`,
  };
};

let storage: ImagesStorage | null = null;

export const useImagesStorage = (): ImagesStorage => {
  storage ??= useRuntimeConfig().images.driver === "s3" ? s3_storage() : filesystem_storage();

  return storage;
};
