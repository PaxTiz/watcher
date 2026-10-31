import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { subscriptionsValidatorsSchema } from "#shared/validators/subscriptions";

export default defineRoute({
  params: subscriptionsValidatorsSchema.find.params,

  async handler(event, { params }) {
    const user = require_user(event);

    return services.subscriptions.find_one(user, params.id_or_slug);
  },
});
