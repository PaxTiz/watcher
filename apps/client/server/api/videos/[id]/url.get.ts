import { createError } from "nuxt/server";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { useRateLimiter } from "#server/lib/rate_limiter";
import { to_proxy_url } from "#server/utils/proxy";
import { require_user } from "#server/utils/session";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.url.params,

  async handler(event, { params }) {
    const user = require_user(event);

    await useRateLimiter("video_url").consume(event, user.id);

    const response = await services.videos.get_url(user, params.id);
    if (!response.url) {
      throw createError({ status: 404 });
    }

    if (response.service === "youtube") {
      return response.url;
    }

    event.res.headers.set("Content-Type", "application/vnd.apple.mpegurl");
    return response.url.replaceAll(
      /((.*)\/(.*)\/((.*)\.m3u8))/g,
      (base_url: string, _: string, __: string, quality: string, path: string) =>
        to_proxy_url({ video_id: params.id, user_id: user.id }, quality, path, base_url),
    );
  },
});
