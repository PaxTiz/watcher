import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.url.params,

  async handler(event, { params }) {
    const url = await services.videos.get_url(params.id);
    if (!url) {
      throw createError({ statusCode: 404 });
    }

    const response = await fetch(url).then((res) => res.text());
    return response
      .replaceAll(/(.*\.mp4)/g, `$1?base_url=${url}`)
      .replaceAll(/(.*\.ts)/g, `$1?base_url=${url}`);
  },
});
