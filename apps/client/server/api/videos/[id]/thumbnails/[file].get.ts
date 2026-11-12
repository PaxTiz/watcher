import { sendRedirect } from "nuxt/server";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import type { ImageFormat } from "#server/utils/images";
import { require_user } from "#server/utils/session";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.large_thumbnail.params,

  async handler(event, { params }) {
    const user = require_user(event);

    const format = params.file.slice(params.file.indexOf(".") + 1) as ImageFormat;
    const url = await services.videos.get_large_thumbnail(user, params.id, format);

    return sendRedirect(event, url, 302);
  },
});
