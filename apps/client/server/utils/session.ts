import { type H3Event } from "h3";

import type { UserResource } from "#shared/resources/users";

export const set_user_session = async (
  event: H3Event,
  user: UserResource,
  login_with: { integration: "google" | "twitch" | "bluesky"; id: string },
) => {
  const ONE_WEEK = 3600 * 24 * 7;

  await setUserSession(
    event,
    {
      user: {
        id: user.id,
        name: user.name,
        bluesky: {
          did: user.bluesky.did,
          handle: user.bluesky.handle,
        },
        integrations: {
          google: user.integrations.google,
          twitch: user.integrations.twitch,
          bluesky: user.integrations.bluesky,
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
