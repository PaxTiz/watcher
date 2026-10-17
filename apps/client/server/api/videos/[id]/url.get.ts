import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.url.params,

  async handler(event, { params }) {
    await requireUserSession(event);

    const response = await services.videos.get_url(params.id);
    if (!response.url) {
      throw createError({ statusCode: 404 });
    }

    if (response.service === "youtube") {
      return response.url;
    }

    setHeader(event, "Content-Type", "application/vnd.apple.mpegurl");
    return response.url.replaceAll(
      /((.*)\/(.*)\/((.*)\.m3u8))/g,
      (base_url: string, _: string, __: string, quality: string, path: string) =>
        to_proxy_url(params.id, quality, path, base_url),
    );
  },
});
