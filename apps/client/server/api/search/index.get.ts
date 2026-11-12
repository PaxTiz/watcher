import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { searchValidatorsSchema } from "#shared/validators/search";

export default defineRoute({
  query: searchValidatorsSchema.search.query,

  async handler(event, { query }) {
    const user = require_user(event);

    return services.search.search(user, {
      query: query.query,
      type: query.type,
      duration: query.duration,
      sort: query.sort,
      guests: query.guests,
    });
  },
});
