import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { oauthValidatorsSchema } from "#shared/validators/oauth";

export default defineRoute({
  query: oauthValidatorsSchema.callback.query,

  async handler(event, { query }) {
    const tokens = await services.external.twitch.oauth.get_tokens(query.code);
    await services.credentials.replace(tokens);

    return sendRedirect(event, "/", 302);
  },
});
