import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  async handler(event) {
    const { user } = await requireUserSession(event);

    return services.subscriptions.find_all(user);
  },
});
