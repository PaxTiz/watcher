import { createHmac, timingSafeEqual } from "node:crypto";

import { useRuntimeConfig } from "nuxt/server";

const MAX_MESSAGE_AGE = 10 * 60 * 1000;

export const eventsub_enabled = () => {
  const { siteUrl, twitch } = useRuntimeConfig();

  return twitch.eventsubSecret.length >= 10 && siteUrl.startsWith("https://");
};

export const eventsub_callback = () =>
  new URL("/api/eventsub/twitch", useRuntimeConfig().siteUrl).toString();

export const eventsub_secret = () => useRuntimeConfig().twitch.eventsubSecret;

export const valid_eventsub_message = (headers: {
  id: string | undefined;
  timestamp: string | undefined;
  signature: string | undefined;
  body: string;
}) => {
  if (!headers.id || !headers.timestamp || !headers.signature?.startsWith("sha256=")) {
    return false;
  }

  const age = Date.now() - new Date(headers.timestamp).getTime();
  if (!Number.isFinite(age) || Math.abs(age) > MAX_MESSAGE_AGE) {
    return false;
  }

  const expected = createHmac("sha256", eventsub_secret())
    .update(headers.id + headers.timestamp + headers.body)
    .digest();
  const received = Buffer.from(headers.signature.slice("sha256=".length), "hex");

  return received.length === expected.length && timingSafeEqual(received, expected);
};
