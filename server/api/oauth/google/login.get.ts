import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  async handler(event) {
    const url = await services.external.google.oauth.get_authorization_url();

    return sendRedirect(event, url, 302);
  },
});
