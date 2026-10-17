import { createHmac, hkdfSync, timingSafeEqual } from "node:crypto";

// Derived from an existing secret so the proxy doesn't need its own env variable
const get_key = () => {
  const secret = Buffer.from(useRuntimeConfig().encryption.credentials.access_token, "hex");

  return Buffer.from(hkdfSync("sha256", secret, "", "watcher:video-proxy", 32));
};

const compute_signature = (video_id: string, url: string) => {
  return createHmac("sha256", get_key()).update(`${video_id}:${url}`).digest("base64url");
};

export const sign_proxy_url = (video_id: string, url: string) => {
  return compute_signature(video_id, url);
};

export const verify_proxy_url = (video_id: string, url: string, signature: string) => {
  const expected = Buffer.from(compute_signature(video_id, url));
  const received = Buffer.from(signature);

  return expected.length === received.length && timingSafeEqual(expected, received);
};

export const to_proxy_url = (video_id: string, quality: string, path: string, base_url: string) => {
  const search = new URLSearchParams({
    base_url,
    signature: sign_proxy_url(video_id, base_url),
  });

  return `/api/videos/${video_id}/segments/${quality}/${path}?${search.toString()}`;
};
