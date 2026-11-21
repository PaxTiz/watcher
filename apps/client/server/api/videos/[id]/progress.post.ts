import { z } from "zod/mini";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.hide.params,

  body: z.object({
    position: z.coerce.number().check(z.minimum(0)),
  }),

  async handler(event, { params, body }) {
    const user = require_user(event);

    await services.videos.update_progress(user, params.id, body.position);
  },
});
