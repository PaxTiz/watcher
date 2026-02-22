import { internal } from "#server/lib/internal";

export default defineEventHandler(async (event) => {
  await internal.subscriptions.sync();
});
