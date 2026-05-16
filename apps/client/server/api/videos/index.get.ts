import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  query: videosValidatorsSchema.list.query,

  async handler(event, { query }) {
    const { user } = await requireUserSession(event);

    return services.videos.find_all(user, {
      page: query.page,
      service: query.service,
      duration: query.duration,
      date: query.date,
      subscription_id: query.subscription_id,
    });
  },
});
