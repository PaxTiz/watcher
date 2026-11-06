import type { UserResource } from "@watcher/common";
import { createError, getRequestHeader, type RequestEvent } from "nuxt/server";

import type { User } from "#auth-utils";
import { replaceUserSession } from "#framework/auth";
import { services } from "#framework/server";

const SESSION_DURATION = 3600 * 24 * 7; // one week, in seconds

declare module "nuxt/schema" {
  interface RequestEventContext {
    user?: User;
    session_id?: string;
  }
}

export const start_user_session = async (
  event: RequestEvent,
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

export const get_user = (event: RequestEvent): User | null => event.context.user ?? null;

export const require_user = (event: RequestEvent): User => {
  if (!event.context.user) {
    throw createError({ status: 401, message: "Unauthorized" });
  }

  return event.context.user;
};

export const require_session_id = (event: RequestEvent): string => {
  if (!event.context.session_id) {
    throw createError({ status: 401, message: "Unauthorized" });
  }

  return event.context.session_id;
};

export const require_recent_authentication = async (event: RequestEvent) => {
  if (!(await services.sessions.is_recently_authenticated(require_session_id(event)))) {
    throw createError({ status: 403, message: "reauthentication_required" });
  }
};
