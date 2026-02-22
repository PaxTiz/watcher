import { external } from "~~/server/lib/external";

export default defineEventHandler(async (event) => {
  const url = await external.google.oauth.get_authorization_url();

  return sendRedirect(event, url);
});
