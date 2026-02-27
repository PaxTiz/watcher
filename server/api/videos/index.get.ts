import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { videosValidatorsSchema } from "~~/shared/validators/videos";

export default defineRoute({
  query: videosValidatorsSchema.list.query,

  async handler(event, { query }) {
    return services.videos.find_all({ page: query.page });
  },
});
