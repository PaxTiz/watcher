import { add } from "date-fns";

import { useLogger } from "#framework";
import { services } from "#framework/server";

export default defineOAuthGoogleEventHandler({
  config: {
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    authorizationParams: { prompt: "consent" },
  },

  async onSuccess(event, { user, tokens }) {
    try {
      let database_user = await services.users.find_by_service_id({
        type: "google",
        id: user.sub,
      });

      if (!database_user) {
        database_user = await services.users.create({
          name: user.name,
          bluesky_did: null,
          bluesky_handle: null,
        });
      }

      await services.credentials.replace(database_user.id, {
        service: "google",
        service_id: user.sub,
        userId: database_user.id,
        access_token: tokens.access_token,
        access_token_expires_at: add(new Date(), { seconds: tokens.expires_in }),
        refresh_token: tokens.refresh_token,
        refresh_token_expires_at: add(new Date(), { seconds: tokens.refresh_token_expires_in }),
      });

      const integration = Boolean(getQuery(event).integration);
      if (!integration) {
        await setUserSession(
          event,
          {
            user: {
              ...database_user,
              loginWith: {
                integration: "google",
              },
            },
          },
          { maxAge: tokens.expires_in },
        );
      }

      return sendRedirect(event, "/?provider=google&oauth-state=success");
    } catch (error) {
      useLogger("oauth.google.onSuccess").error(error);
      return sendRedirect(event, "/?provider=google&oauth-state=error");
    }
  },

  onError(event, error) {
    useLogger("oauth.google.onError").error(error);
    return sendRedirect(event, "/?provider=google&oauth-state=error");
  },
});
