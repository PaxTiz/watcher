import { sendRedirect } from "nuxt/server";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.large_thumbnail.params,

  async handler(event, { params }) {
    const user = require_user(event);

    const url = await services.videos.get_large_thumbnail(user, params.id);

    return sendRedirect(event, url, 302);
  },
});
