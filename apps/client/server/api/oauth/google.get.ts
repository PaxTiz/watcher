import { add } from "date-fns";
import { defineEventHandler, sendRedirect } from "nuxt/server";

import { useLogger } from "#framework";
import { defineOAuthGoogleEventHandler } from "#framework/auth";
import { services } from "#framework/server";
import { get_client_ip, useRateLimiter } from "#server/lib/rate_limiter";
import {
  confirm_reauthentication,
  consume_oauth_intent,
  handle_oauth_intent,
} from "#server/utils/oauth";
import { get_user, start_user_session } from "#server/utils/session";

const oauth_handler = defineOAuthGoogleEventHandler({
  config: {
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    authorizationParams: { prompt: "consent" },
  },

  async onSuccess(event, { user, tokens }) {
    try {
      const sessionUser = get_user(event);
      const intent = await consume_oauth_intent(event, "google");

      const existing_credential = await services.credentials.find_by_service("google", user.sub);

      let database_user;

      if (sessionUser) {
        if (intent === "reauthenticate") {
          return confirm_reauthentication(event, "google", existing_credential);
        }

        if (!intent) {
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

  onError(event, error) {
    useLogger("oauth.google.onError").error(
      { status: error.status, message: error.message },
      "OAuth flow failed",
    );
    return sendRedirect(event, "/?provider=google&oauth-state=error");
  },
});

export default defineEventHandler(async (event) => {
  const ip = get_client_ip(event);
  if (ip) {
    const limiter = useRateLimiter("oauth");
    const state = await limiter.increment(ip);
    limiter.set_headers(event, state);

    if (!state.is_valid) {
      return sendRedirect(
        event,
        `/?provider=google&oauth-state=error&error=too_many_attempts&retry_after=${state.reset_in}`,
      );
    }
  }

  if (!(await handle_oauth_intent(event, "google"))) {
    return sendRedirect(
      event,
      "/settings?provider=google&oauth-state=error&error=reauthentication_required",
    );
  }

  return oauth_handler(event);
});
