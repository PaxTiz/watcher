import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.url.params,

  async handler(event, { params }) {
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
      `/api/videos/${params.id}/segments/$3/$4?base_url=$1`,
    );
  },
});
