import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  async handler() {
    return services.videos.find_all({ page: 1 });
  },
});
