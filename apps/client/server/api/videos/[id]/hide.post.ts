import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.hide.params,

  async handler(event, { params }) {
    const user = require_user(event);

    await services.videos.hide(user, params.id);
  },
});
