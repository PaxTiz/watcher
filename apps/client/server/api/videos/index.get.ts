import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  query: videosValidatorsSchema.list.query,

  async handler(event, { query }) {
    const user = require_user(event);

    return services.videos.find_all(user, {
      page: query.page,
      per_page: query.per_page,
      before: query.before,
      with_total: query.with_total,
      sort: query.sort,
      query: query.query,
      service: query.service,
      duration: query.duration,
      date: query.date,
      subscription_id: query.subscription_id,
      mentions: query.mentions,
      is_favorite: query.is_favorite,
      in_progress: query.in_progress,
      with_hidden: query.with_hidden,
      with_watched: query.with_watched,
    });
  },
});
