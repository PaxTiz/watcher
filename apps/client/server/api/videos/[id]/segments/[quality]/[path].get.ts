import { createError } from "nuxt/server";

import { defineRoute } from "#framework";
import {
  OUTGOING_REQUEST_TIMEOUT,
  content_type_of,
  read_body_with_limit,
  stream_body_with_limit,
} from "#server/utils/http";
import { is_allowed_upstream, to_proxy_url, verify_proxy_url } from "#server/utils/proxy";
import { require_user } from "#server/utils/session";
import { videosValidatorsSchema } from "#shared/validators/videos";

const MAX_PLAYLIST_SIZE = 2 * 1024 * 1024; // 2 MB, in bytes
const MAX_SEGMENT_SIZE = 50 * 1024 * 1024; // 50 MB, in bytes

const fetch_upstream = async (url: string) => {
  if (!is_allowed_upstream(url)) {
    throw createError({ status: 403 });
  }

  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(OUTGOING_REQUEST_TIMEOUT),
  }).catch(() => null);

  if (!response?.ok) {
    await response?.body?.cancel();
    throw createError({ status: 502 });
  }

  return response;
};

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

    if (params.path.endsWith(".ts")) {
      const response = await fetch_upstream(`${base_path}/${params.path}`);

      const body = stream_body_with_limit(response, MAX_SEGMENT_SIZE);
      if (!body) {
        throw createError({ status: 502 });
      }

      event.res.headers.set("Content-Type", content_type_of(response) ?? "video/mp2t");
      return body;
    }

    const quality = base_path.slice(base_path.lastIndexOf("/") + 1);

    const response = await fetch_upstream(base_url);
    const playlist = await read_body_with_limit(response, MAX_PLAYLIST_SIZE);
    if (!playlist) {
      throw createError({ status: 502 });
    }

    event.res.headers.set("Content-Type", "application/vnd.apple.mpegurl");
    return playlist
      .toString("utf8")
      .replaceAll(/((\d+)\.ts)/g, (path: string) =>
        to_proxy_url({ video_id: params.id, user_id: user.id }, quality, path, base_url),
      );
  },
});
