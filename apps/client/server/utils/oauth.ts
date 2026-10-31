import type { CredentialsType } from "@watcher/common";
import { type H3Event } from "h3";

import type { SecureSessionData } from "#auth-utils";

const LINK_INTENT_TTL = 60 * 10 * 1000; // 10 minutes (the OAuth state cookie lifetime), in ms

const write_link_intent = async (
  event: H3Event,
  link_intent?: SecureSessionData["link_intent"],
) => {
  const { user, secure } = await getUserSession(event);
  if (!user || !secure || (!secure.link_intent && !link_intent)) {
    return;
  }

  await replaceUserSession(event, { user, secure: { ...secure, link_intent } });
};

// Linking a provider to the signed-in account must be explicitly requested by the user (from the
// settings page, `?integration=true`) at the start of the flow, then confirmed in the callback.
// A callback reaching a signed-in session without this intent is never turned into a link.
export const handle_link_intent = async (event: H3Event, provider: CredentialsType) => {
  const query = getQuery(event);

  // Callback: the intent is consumed by `consume_link_intent`
  if (query.code) {
    return;
  }

  const requested = query.integration === "true" && !!event.context.user;

  await write_link_intent(
    event,
    requested ? { provider, expires_at: Date.now() + LINK_INTENT_TTL } : undefined,
  );
};

export const consume_link_intent = async (event: H3Event, provider: CredentialsType) => {
  const { secure } = await getUserSession(event);
  const link_intent = secure?.link_intent;

  if (!link_intent) {
    return false;
  }

  await write_link_intent(event, undefined);

  return link_intent.provider === provider && link_intent.expires_at > Date.now();
};
