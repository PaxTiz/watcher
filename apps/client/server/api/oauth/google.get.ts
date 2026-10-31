import { add } from "date-fns";
import { defineEventHandler } from "nuxt/server";

import { useLogger } from "#framework";
import { services } from "#framework/server";

const oauth_handler = defineOAuthGoogleEventHandler({
  config: {
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    authorizationParams: { prompt: "consent" },
  },

  async onSuccess(request_event, { user, tokens }) {
    const event = to_h3_event(request_event);

    try {
      const sessionUser = get_user(event);
      const link_requested = await consume_link_intent(event, "google");

      const existing_credential = await services.credentials.find_by_service("google", user.sub);

      let database_user;

      if (sessionUser) {
        if (!link_requested) {
          return sendRedirect(
            event,
            "/?provider=google&oauth-state=error&error=link_not_requested",
          );
        }

        if (existing_credential && existing_credential.userId !== sessionUser.id) {
          return sendRedirect(event, "/?provider=google&oauth-state=error&error=already_linked");
        }

        database_user = await services.users.find_by_id(sessionUser.id);
      } else if (existing_credential) {
        database_user = await services.users.find_by_id(existing_credential.userId);
      }

      if (!database_user) {
        database_user = await services.users.create({ name: user.name });
      }

      await services.credentials.replace(database_user.id, {
        service: "google",
        service_id: user.sub,
        userId: database_user.id,
        access_token: tokens.access_token,
        access_token_expires_at: add(new Date(), { seconds: tokens.expires_in }),
        refresh_token: tokens.refresh_token,
        refresh_token_expires_at: tokens.refresh_token_expires_in
          ? add(new Date(), { seconds: tokens.refresh_token_expires_in })
          : null,
      });

      // Linking an integration keeps the current session; otherwise, this is a login
      if (!sessionUser) {
        database_user = (await services.users.find_by_id(database_user.id))!;

        await start_user_session(event, database_user, {
          integration: "google",
          id: user.sub,
        });
      }

      return sendRedirect(event, "/?provider=google&oauth-state=success");
    } catch (error) {
      useLogger("oauth.google.onSuccess").error(error);
      return sendRedirect(event, "/?provider=google&oauth-state=error");
    }
  },

  onError(request_event, error) {
    const event = to_h3_event(request_event);

    useLogger("oauth.google.onError").error(error);
    return sendRedirect(event, "/?provider=google&oauth-state=error");
  },
});

export default defineEventHandler(async (event) => {
  await handle_link_intent(to_h3_event(event), "google");

  return oauth_handler(event);
});
