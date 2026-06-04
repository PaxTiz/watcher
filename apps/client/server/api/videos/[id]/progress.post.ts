import { z } from "zod/mini";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.hide.params,

  body: z.object({
    progression: z.coerce.number().check(z.minimum(0), z.maximum(1)),
  }),

  async handler(event, { params, body }) {
    const { user } = await requireUserSession(event);

    await services.videos.update_progress(user, params.id, body.progression);
  },
});
