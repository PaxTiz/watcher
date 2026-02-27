import { services } from "#framework/server";

export default defineEventHandler(async (event) => {
  const url = await services.external.twitch.oauth.get_authorization_url();

  return sendRedirect(event, url);
});
