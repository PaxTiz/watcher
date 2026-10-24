import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.find.params,

  async handler(event, { params }) {
    const user = require_user(event);
    return services.videos.get_by_id(user, params.id);
  },
});
