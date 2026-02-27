import { services } from "#framework/server";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;

  const tokens = await services.external.twitch.oauth.get_tokens(code);
  await services.credentials.replace(tokens);

  return sendRedirect(event, "/");
});
