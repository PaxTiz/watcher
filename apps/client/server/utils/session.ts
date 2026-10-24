import type { UserResource } from "@watcher/common";
import { type H3Event } from "h3";

import type { User } from "#auth-utils";
import { services } from "#framework/server";

const SESSION_DURATION = 3600 * 24 * 7; // one week, in seconds

declare module "h3" {
  interface H3EventContext {
    user?: User;
    session_id?: string;
  }
}

export const start_user_session = async (
  event: H3Event,
  user: UserResource,
  login_with: User["login_with"],
) => {
  if (event.context.session_id) {
    await services.sessions.revoke(event.context.session_id);
  }

  const user_agent = getRequestHeader(event, "user-agent")?.slice(0, 512) ?? null;
  const session_id = await services.sessions.create(
    user.id,
    login_with,
    user_agent,
    SESSION_DURATION,
  );

  const session_user: User = {
    id: user.id,
    name: user.name,
    integrations: {
      google: user.integrations.google,
      twitch: user.integrations.twitch,
    },
    is_onboarded: user.is_onboarded,
    created_at: user.created_at,
    last_login_at: user.last_login_at,
    login_with,
  };

  await replaceUserSession(
    event,
    { user: session_user, secure: { session_id } },
    { maxAge: SESSION_DURATION },
  );

  event.context.user = session_user;
  event.context.session_id = session_id;
};

export const get_user = (event: H3Event): User | null => event.context.user ?? null;

export const require_user = (event: H3Event): User => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  return event.context.user;
};

export const require_session_id = (event: H3Event): string => {
  if (!event.context.session_id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  return event.context.session_id;
};
