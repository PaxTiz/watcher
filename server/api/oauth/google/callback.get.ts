import { external } from "~~/server/lib/external";
import { internal } from "~~/server/lib/internal";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;

  const tokens = await external.google.oauth.get_tokens(code);
  await internal.credentials.replace(tokens);

  return sendRedirect(event, "/");
});
