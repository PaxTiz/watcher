import type { CredentialsType, ServiceCredentials } from "@watcher/common";
import { getQuery, type RequestEvent, sendRedirect } from "nuxt/server";

import type { SecureSessionData } from "#auth-utils";
import { getUserSession, replaceUserSession } from "#framework/auth";
import { services } from "#framework/server";
import { require_session_id, require_user } from "#server/utils/session";

type OAuthIntent = NonNullable<SecureSessionData["oauth_intent"]>;

const OAUTH_INTENT_TTL = 60 * 10 * 1000; // 10 minutes (the OAuth state cookie lifetime), in ms

const write_oauth_intent = async (event: RequestEvent, oauth_intent?: OAuthIntent) => {
  const { user, secure } = await getUserSession(event);
  if (!user || !secure || (!secure.oauth_intent && !oauth_intent)) {
    return;
  }

  await replaceUserSession(event, { user, secure: { ...secure, oauth_intent } });
};

const requested_purpose = (event: RequestEvent): OAuthIntent["purpose"] | undefined => {
  if (!event.context.user) {
    return;
  }

  const query = getQuery(event);

  if (query.integration === "true") {
    return "link";
  }

  return query.reauthenticate === "true" ? "reauthenticate" : undefined;
};

export const handle_oauth_intent = async (event: RequestEvent, provider: CredentialsType) => {
  if (getQuery(event).code) {
    return true;
  }

  const purpose = requested_purpose(event);

  if (
    purpose === "link" &&
    !(await services.sessions.is_recently_authenticated(require_session_id(event)))
  ) {
    return false;
  }

  await write_oauth_intent(
    event,
    purpose ? { provider, purpose, expires_at: Date.now() + OAUTH_INTENT_TTL } : undefined,
  );

  return true;
};

export const consume_oauth_intent = async (event: RequestEvent, provider: CredentialsType) => {
  const { secure } = await getUserSession(event);
  const oauth_intent = secure?.oauth_intent;

  if (!oauth_intent) {
    return null;
  }

  await write_oauth_intent(event, undefined);

  return oauth_intent.provider === provider && oauth_intent.expires_at > Date.now()
    ? oauth_intent.purpose
    : null;
};

export const confirm_reauthentication = async (
  event: RequestEvent,
  provider: CredentialsType,
  credential: ServiceCredentials | null,
) => {
  if (credential?.userId !== require_user(event).id) {
    return sendRedirect(
      event,
      `/settings?provider=${provider}&oauth-state=error&error=wrong_account`,
    );
  }

  await services.sessions.mark_authenticated(require_session_id(event));

  return sendRedirect(
    event,
    `/settings?provider=${provider}&oauth-state=success&reauthenticated=true`,
  );
};
