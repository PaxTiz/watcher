import { subscriptionsSync } from "@watcher/database";
import { createError, defineEventHandler, getQuery, getRequestHeader } from "nuxt/server";

import { useLogger } from "#framework";
import { valid_websub_signature, websub_enabled } from "#server/utils/websub";

const logger = () => useLogger("api.websub.youtube");

export default defineEventHandler(async (event) => {
  const channel_id = String(getQuery(event).channel_id ?? "");
  if (!websub_enabled() || !channel_id) {
    throw createError({ statusCode: 404 });
  }

  const body = await event.req.text();

  if (!valid_websub_signature(channel_id, body, getRequestHeader(event, "x-hub-signature"))) {
    logger().warn({ channel_id }, "WebSub notification with an invalid signature ignored");
    return "";
  }

  const woken = await subscriptionsSync.wake({ service: "youtube", channel_id });
  logger().debug({ channel_id, woken }, "WebSub notification received");

  return "";
});
