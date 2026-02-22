import { internal } from "#server/lib/internal";

export default defineEventHandler(async (event) => {
  return internal.subscriptions.find_all();
});
