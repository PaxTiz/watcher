import { createHmac, timingSafeEqual } from "node:crypto";

import { useRuntimeConfig } from "nuxt/server";

export const websub_enabled = () => {
  const { siteUrl, google } = useRuntimeConfig();

  return !!google.websubSecret && siteUrl.startsWith("https://");
};

export const websub_secret = (channel_id: string) =>
  createHmac("sha256", useRuntimeConfig().google.websubSecret).update(channel_id).digest("hex");

export const websub_callback = (channel_id: string) => {
  const url = new URL("/api/websub/youtube", useRuntimeConfig().siteUrl);
  url.searchParams.set("channel_id", channel_id);

  return url.toString();
};

export const valid_websub_signature = (
  channel_id: string,
  body: string,
  signature: string | undefined,
) => {
  const [algorithm, hex] = signature?.split("=") ?? [];
  if (!algorithm || !hex || !["sha1", "sha256", "sha384", "sha512"].includes(algorithm)) {
    return false;
  }

  const expected = createHmac(algorithm, websub_secret(channel_id)).update(body).digest();
  const received = Buffer.from(hex, "hex");

  return received.length === expected.length && timingSafeEqual(received, expected);
};
