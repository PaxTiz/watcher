import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  async handler() {
    await services.subscriptions.sync();
  },
});
