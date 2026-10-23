import type { UserResource } from "@watcher/common";
import { type H3Event } from "h3";

import type { User } from "#auth-utils";

export const set_user_session = async (
  event: H3Event,
  user: UserResource,
  login_with: User["login_with"],
) => {
  const ONE_WEEK = 3600 * 24 * 7;

  await setUserSession(
    event,
    {
      user: {
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
      },
    },
    { maxAge: ONE_WEEK },
  );
};
