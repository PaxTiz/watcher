import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  params: videosValidatorsSchema.find.params,

  async handler(event, { params }) {
    return services.videos.get_by_id(params.id);
  },
});
