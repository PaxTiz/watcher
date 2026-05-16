import { useLogger } from "#framework";
import { services } from "#framework/server";
import { useBluesky } from "#server/lib/bluesky";

const SESSION_DURATION = 3600 * 24 * 7; // 1 week

export default defineOAuthBlueskyEventHandler({
  config: {
    scope: ["atproto", "transition:generic", "transition:email"],
  },

  async onSuccess(event, { user }) {
    try {
      const bluesky = useBluesky();
      const profile = await bluesky.getProfile({ actor: user.did });

      const isNameEmpty = profile.data.displayName?.trim().length === 0;
      const name = (isNameEmpty ? profile.data.handle : profile.data.displayName) ?? "";

      const { user: sessionUser } = await getUserSession(event);

      let database_user = await services.users.find_by_bluesky_did(user.did);

      if (sessionUser) {
        if (database_user && database_user.id !== sessionUser.id) {
          return sendRedirect(event, "/?provider=bluesky&oauth-state=error&error=already_linked");
        }

        database_user = await services.users.update(sessionUser.id, {
          bluesky_did: profile.data.did,
          bluesky_handle: profile.data.handle,
        });
      } else if (!database_user) {
        database_user = await services.users.create({
          name,
          bluesky_did: profile.data.did,
          bluesky_handle: profile.data.handle,
        });
      }

      await setUserSession(
        event,
        {
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
              integration: "bluesky",
              id: user.did,
            },
          },
        },
        { maxAge: SESSION_DURATION },
      );

      return sendRedirect(event, "/?provider=bluesky&oauth-state=success");
    } catch (error) {
      useLogger("oauth.bluesky.onSuccess").error(error);
      return sendRedirect(event, "/?provider=bluesky&oauth-state=error");
    }
  },

  onError(event, error) {
    useLogger("oauth.bluesky.onError").error(error);
    return sendRedirect(event, "/?provider=bluesky&oauth-state=error");
  },
});
