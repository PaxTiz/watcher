import { subscriptionsSync } from "@watcher/database";
import { createError, defineEventHandler, getRequestHeader, setResponseStatus } from "nuxt/server";

import { useLogger } from "#framework";
import { eventsub_enabled, valid_eventsub_message } from "#server/utils/eventsub";

const logger = () => useLogger("api.eventsub.twitch");

const VODS_DELAY_SECONDS = 10 * 60;

type Message = {
  challenge?: string;
  subscription: { id: string; type: string; status: string };
  event?: { broadcaster_user_id: string };
};

export default defineEventHandler(async (event) => {
  if (!eventsub_enabled()) {
    throw createError({ statusCode: 404 });
  }

  const body = await event.req.text();
  const valid = valid_eventsub_message({
    id: getRequestHeader(event, "twitch-eventsub-message-id"),
    timestamp: getRequestHeader(event, "twitch-eventsub-message-timestamp"),
    signature: getRequestHeader(event, "twitch-eventsub-message-signature"),
    body,
  });
  if (!valid) {
    logger().warn("EventSub message with an invalid signature rejected");
    throw createError({ statusCode: 403 });
  }

  const message = JSON.parse(body) as Message;
  const type = getRequestHeader(event, "twitch-eventsub-message-type");

  if (type === "webhook_callback_verification") {
    event.res.headers.set("Content-Type", "text/plain");
    return message.challenge ?? "";
  }

  if (type === "revocation") {
    logger().warn(
      { subscription_id: message.subscription.id, status: message.subscription.status },
      "EventSub subscription revoked",
    );
  } else if (type === "notification" && message.event?.broadcaster_user_id) {
    const channel_id = message.event.broadcaster_user_id;
    const woken = await subscriptionsSync.end_live({
      service: "twitch",
      channel_id,
      vods_delay_seconds: VODS_DELAY_SECONDS,
    });
    logger().debug({ channel_id, woken }, "Twitch live ended (EventSub)");
  }

  setResponseStatus(event, 204);
  return "";
});
