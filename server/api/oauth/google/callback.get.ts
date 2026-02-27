import { services } from "#framework/server";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;
  const state = query.state as string;

  const tokens = await services.external.google.oauth.get_tokens(state, code);
  await services.credentials.replace(tokens);

  return sendRedirect(event, "/");
});
