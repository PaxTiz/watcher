import { add } from "date-fns";
import { defineEventHandler, sendRedirect } from "nuxt/server";

import { useLogger } from "#framework";
import { defineOAuthTwitchEventHandler } from "#framework/auth";
import { services } from "#framework/server";
import { consume_link_intent, handle_link_intent } from "#server/utils/oauth";
import { get_user, start_user_session } from "#server/utils/session";

const oauth_handler = defineOAuthTwitchEventHandler({
  config: {
    scope: ["user:read:email", "user:read:follows", "user:read:subscriptions"],
  },

  async onSuccess(request_event, { user, tokens }) {
    const event = request_event;

    try {
      const sessionUser = get_user(event);
      const link_requested = await consume_link_intent(event, "twitch");

      const existing_credential = await services.credentials.find_by_service("twitch", user.id);

      let database_user;

      if (sessionUser) {
        if (!link_requested) {
          return sendRedirect(
            event,
            "/?provider=twitch&oauth-state=error&error=link_not_requested",
          );
        }

        if (existing_credential && existing_credential.userId !== sessionUser.id) {
          return sendRedirect(event, "/?provider=twitch&oauth-state=error&error=already_linked");
        }

        database_user = await services.users.find_by_id(sessionUser.id);
      } else if (existing_credential) {
        database_user = await services.users.find_by_id(existing_credential.userId);
      }

      if (!database_user) {
        database_user = await services.users.create({ name: user.display_name });
      }

      await services.credentials.replace(database_user.id, {
        service: "twitch",
        service_id: user.id,
        userId: database_user.id,
        access_token: tokens.access_token,
        access_token_expires_at: add(new Date(), { seconds: tokens.expires_in }),
        refresh_token: tokens.refresh_token,
        refresh_token_expires_at: null,
      });

      // Linking an integration keeps the current session; otherwise, this is a login
      if (!sessionUser) {
        database_user = (await services.users.find_by_id(database_user.id))!;

        await start_user_session(event, database_user, {
          integration: "twitch",
          id: user.id,
        });
      }

      return sendRedirect(event, "/?provider=twitch&oauth-state=success");
    } catch (error) {
      useLogger("oauth.twitch.onSuccess").error(error);
      return sendRedirect(event, "/?provider=twitch&oauth-state=error");
    }
  },

  onError(request_event, error) {
    const event = request_event;

    useLogger("oauth.twitch.onError").error(error);
    return sendRedirect(event, "/?provider=twitch&oauth-state=error");
  },
});

export default defineEventHandler(async (event) => {
  await handle_link_intent(event, "twitch");

  return oauth_handler(event);
});
