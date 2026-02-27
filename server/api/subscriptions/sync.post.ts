import { services } from "#framework/server";

export default defineEventHandler(async (event) => {
  await services.subscriptions.sync();
});
