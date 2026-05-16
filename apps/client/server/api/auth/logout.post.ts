import { defineRoute } from "#framework";

export default defineRoute({
  async handler(event) {
    await clearUserSession(event);
  },
});
