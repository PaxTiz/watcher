import { services } from "#framework/server";

export default defineEventHandler(async (event) => {
  return services.subscriptions.find_all();
});
