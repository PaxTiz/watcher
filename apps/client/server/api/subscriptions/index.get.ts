import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { require_user } from "#server/utils/session";
import { subscriptionsValidatorsSchema } from "#shared/validators/subscriptions";

export default defineRoute({
  query: subscriptionsValidatorsSchema.list.query,

  async handler(event, { query }) {
    const user = require_user(event);

    return services.subscriptions.find_all(user, { query: query.query });
  },
});
