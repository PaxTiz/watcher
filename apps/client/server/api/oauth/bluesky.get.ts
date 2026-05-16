import { useLogger } from "#framework";
import { services } from "#framework/server";
import { useBluesky } from "#server/lib/bluesky";

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

      await set_user_session(event, database_user, {
        integration: "bluesky",
        id: user.did,
      });

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
