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
      const { user: sessionUser } = await getUserSession(event);

      const existing_credential = await services.credentials.find_by_service("google", user.sub);

      let database_user;

      if (sessionUser) {
        if (existing_credential && existing_credential.userId !== sessionUser.id) {
          return sendRedirect(event, "/?provider=google&oauth-state=error&error=already_linked");
        }

        database_user = await services.users.find_by_id(sessionUser.id);
      } else if (existing_credential) {
        database_user = await services.users.find_by_id(existing_credential.userId);
      }

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

      database_user = (await services.users.find_by_id(database_user.id))!;

      await setUserSession(event, {
        user: {
          id: database_user.id,
          name: database_user.name,
          bluesky: {
            did: database_user.bluesky.did,
            handle: database_user.bluesky.handle,
          },
          integrations: {
            google: database_user.integrations.google,
            twitch: database_user.integrations.twitch,
            bluesky: database_user.integrations.bluesky,
          },
          created_at: database_user.created_at,
          last_login_at: database_user.last_login_at,
          login_with: {
            integration: "google",
            id: user.sub,
          },
        },
      });

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
