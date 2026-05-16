import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  async handler(event) {
    const { user } = await requireUserSession(event);

    await services.users.delete(user.id);
    await clearUserSession(event);
  },
});
