import { createHash } from "node:crypto";

import { request_options } from "@watcher/common";
import { defineCachedFunction } from "nitropack/runtime";
import { createError } from "nuxt/server";
import { ofetch } from "ofetch";

import { defineRoute } from "#framework";
import { content_type_of, read_body_with_limit, stream_body_with_limit } from "#server/utils/http";
import { is_allowed_upstream, proxy_url_builder, verify_proxy_url } from "#server/utils/proxy";
import { require_user } from "#server/utils/session";
import { videosValidatorsSchema } from "#shared/validators/videos";

const MAX_PLAYLIST_SIZE = 2 * 1024 * 1024; // 2 MB, in bytes
const MAX_SEGMENT_SIZE = 50 * 1024 * 1024; // 50 MB, in bytes
const PLAYLIST_CACHE_TTL = 60 * 5; // 5 minutes, in seconds
const SEGMENT_CACHE_TTL = 3600 * 24; // one day (the lifetime of a proxy URL), in seconds

// Media lines, and the init segment of fMP4 playlists (`#EXT-X-MAP:URI="init-0.mp4"`)
const SEGMENT_PATTERN = /^[\w-]+\.(?:ts|mp4)$|(?<=URI=")[\w-]+\.mp4(?=")/gm;

const fetch_upstream = async (url: string) => {
  if (!is_allowed_upstream(url)) {
    throw createError({ status: 403 });
  }

  const response = await ofetch
    .raw(url, { ...request_options({ retry: 0 }), responseType: "stream", redirect: "error" })
    .catch(() => null);

  if (!response) {
    throw createError({ status: 502 });
  }

  return response;
};

const get_upstream_playlist = defineCachedFunction(
  async (url: string) => {
    const response = await fetch_upstream(url);
    const playlist = await read_body_with_limit(response, MAX_PLAYLIST_SIZE);
    if (!playlist) {
      throw createError({ status: 502 });
    }

    return playlist.toString("utf8");
  },
  {
    name: "twitch_playlist",
    maxAge: PLAYLIST_CACHE_TTL,
    swr: false,
    getKey: (url: string) => createHash("sha256").update(url).digest("hex"),
  },
);

export default defineRoute({
  query: videosValidatorsSchema.segment.query,
  params: videosValidatorsSchema.segment.params,

  async handler(event, { query, params }) {
    const user = require_user(event);

    const base_url = query.base_url;
    const payload = {
      video_id: params.id,
      user_id: user.id,
      expires: query.expires,
      url: base_url,
    };

    if (!verify_proxy_url(payload, query.signature)) {
      throw createError({ status: 403 });
    }

    const base_path = base_url.slice(0, base_url.lastIndexOf("/"));

    if (!params.path.endsWith(".m3u8")) {
      const response = await fetch_upstream(`${base_path}/${params.path}`);

      const body = stream_body_with_limit(response, MAX_SEGMENT_SIZE);
      if (!body) {
        throw createError({ status: 502 });
      }

      const content_length = response.headers.get("content-length");
      if (content_length) {
        event.res.headers.set("Content-Length", content_length);
      }

      event.res.headers.set("Content-Type", content_type_of(response) ?? "video/mp2t");
      event.res.headers.set("Cache-Control", `private, max-age=${SEGMENT_CACHE_TTL}, immutable`);
      return body;
    }

    const quality = base_path.slice(base_path.lastIndexOf("/") + 1);

    const playlist = await get_upstream_playlist(base_url);
    const to_proxy_url = proxy_url_builder({ video_id: params.id, user_id: user.id }, base_url);

    event.res.headers.set("Content-Type", "application/vnd.apple.mpegurl");
    return playlist.replaceAll(SEGMENT_PATTERN, (path: string) => to_proxy_url(quality, path));
  },
});
