import { add } from "date-fns";

import { useLogger } from "#framework";
import { services } from "#framework/server";

export default defineOAuthTwitchEventHandler({
  config: {
    scope: ["user:read:email", "user:read:follows", "user:read:subscriptions"],
  },

  async onSuccess(event, { user, tokens }) {
    try {
      console.log(user, tokens);

      let database_user = await services.users.find_by_service_id({
        type: "twitch",
        id: user.id,
      });

      if (!database_user) {
        database_user = await services.users.create({
          name: user.display_name,
          bluesky_did: null,
          bluesky_handle: null,
        });
      }

      await services.credentials.replace(database_user.id, {
        service: "twitch",
        service_id: user.id,
        userId: database_user.id,
        access_token: tokens.access_token,
        access_token_expires_at: add(new Date(), { seconds: tokens.expires_in }),
        refresh_token: tokens.refresh_token,
        refresh_token_expires_at: add(new Date(), { seconds: tokens.expires_in }),
      });

      const integration = Boolean(getQuery(event).integration);
      if (!integration) {
        await setUserSession(
          event,
          {
            user: {
              ...database_user,
              loginWith: {
                integration: "twitch",
              },
            },
          },
          { maxAge: tokens.expires_in },
        );
      }

      return sendRedirect(event, "/?provider=twitch&oauth-state=success");
    } catch (error) {
      useLogger("oauth.twitch.onSuccess").error(error);
      return sendRedirect(event, "/?provider=twitch&oauth-state=error");
    }
  },

  onError(event, error) {
    useLogger("oauth.twitch.onError").error(error);
    return sendRedirect(event, "/?provider=twitch&oauth-state=error");
  },
});
