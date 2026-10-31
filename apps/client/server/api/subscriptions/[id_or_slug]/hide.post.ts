import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { subscriptionsValidatorsSchema } from "#shared/validators/subscriptions";

export default defineRoute({
  params: subscriptionsValidatorsSchema.hide.params,

  async handler(event, { params }) {
    const user = require_user(event);

    await services.subscriptions.hide(user, params.id_or_slug);
  },
});
