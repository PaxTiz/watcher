import { subscriptionsSync } from "@watcher/database";
import { to_websub_topic } from "@watcher/integration-google";
import { createError, defineEventHandler, getQuery } from "nuxt/server";

import { useLogger } from "#framework";
import { websub_enabled } from "#server/utils/websub";

const logger = () => useLogger("api.websub.youtube");

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const channel_id = String(query.channel_id ?? "");
  const mode = String(query["hub.mode"] ?? "");
  const challenge = String(query["hub.challenge"] ?? "");

  if (!websub_enabled() || !channel_id || query["hub.topic"] !== to_websub_topic(channel_id)) {
    throw createError({ statusCode: 404 });
  }

  if (mode === "denied") {
    logger().warn({ channel_id, reason: query["hub.reason"] }, "WebSub subscription denied");
    return "";
  }

  if (mode === "subscribe") {
    const lease_seconds = Number(query["hub.lease_seconds"]);
    if (!Number.isFinite(lease_seconds) || lease_seconds <= 0) {
      throw createError({ statusCode: 400 });
    }

    const confirmed = await subscriptionsSync.confirm_websub({
      service: "youtube",
      channel_id,
      expires_at: new Date(Date.now() + lease_seconds * 1000).toISOString(),
      renew_at: new Date(Date.now() + lease_seconds * 800).toISOString(),
    });
    if (!confirmed) {
      throw createError({ statusCode: 404 });
    }

    logger().debug({ channel_id, lease_seconds }, "WebSub subscription confirmed");
  } else if (mode !== "unsubscribe") {
    throw createError({ statusCode: 400 });
  }

  return challenge;
});
