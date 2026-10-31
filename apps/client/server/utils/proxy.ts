import { createHmac, hkdfSync, timingSafeEqual } from "node:crypto";

import { useRuntimeConfig } from "nuxt/server";

// A VOD playlist is fetched once, then its segments for the whole viewing session: the URLs must
// outlive a long video paused for a while. They are bound to the user, so a leaked one is useless
// to other accounts.
const PROXY_URL_TTL = 3600 * 24; // one day, in seconds

// Hosts Twitch serves VODs from (`seekPreviewsURL` points to CloudFront distributions). Signed URLs
// can only target them: defense in depth, should the signing key ever leak.
const ALLOWED_HOST_SUFFIXES = [".cloudfront.net", ".twitch.tv", ".ttvnw.net"];

export const is_allowed_upstream = (url: string) => {
  const { protocol, hostname } = new URL(url);

  return protocol === "https:" && ALLOWED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
};

// Derived from an existing secret so the proxy doesn't need its own env variable
const get_key = () => {
  const secret = Buffer.from(useRuntimeConfig().encryption.credentials.access_token, "hex");

  return Buffer.from(hkdfSync("sha256", secret, "", "watcher:video-proxy", 32));
};

type ProxyUrlPayload = {
  video_id: string;
  user_id: string;
  expires: number;
  url: string;
};

const compute_signature = ({ video_id, user_id, expires, url }: ProxyUrlPayload) => {
  return createHmac("sha256", get_key())
    .update(`${video_id}:${user_id}:${expires}:${url}`)
    .digest("base64url");
};

export const verify_proxy_url = (payload: ProxyUrlPayload, signature: string) => {
  if (payload.expires < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = Buffer.from(compute_signature(payload));
  const received = Buffer.from(signature);

  return expected.length === received.length && timingSafeEqual(expected, received);
};

export const to_proxy_url = (
  { video_id, user_id }: { video_id: string; user_id: string },
  quality: string,
  path: string,
  base_url: string,
) => {
  if (!is_allowed_upstream(base_url)) {
    throw new Error(`Refusing to proxy an unexpected host: ${new URL(base_url).host}`);
  }

  const expires = Math.floor(Date.now() / 1000) + PROXY_URL_TTL;
  const search = new URLSearchParams({
    base_url,
    expires: expires.toString(),
    signature: compute_signature({ video_id, user_id, expires, url: base_url }),
  });

  return `/api/videos/${video_id}/segments/${quality}/${path}?${search.toString()}`;
};
