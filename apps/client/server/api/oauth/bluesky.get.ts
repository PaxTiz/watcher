import { useLogger } from "#framework";
import { useDatabase } from "#server/database";
import { useBluesky } from "#server/lib/bluesky";

const SESSION_DURATION = 3600 * 24 * 7; // 1 week

export default defineOAuthBlueskyEventHandler({
  config: {
    scope: ["atproto", "transition:generic", "transition:email"],
  },

  async onSuccess(event, { user }) {
    try {
      const bluesky = useBluesky();
      const database = useDatabase();

      const profile = await bluesky.getProfile({ actor: user.did });

      const isNameEmpty = profile.data.displayName?.trim().length === 0;
      const name = (isNameEmpty ? profile.data.handle : profile.data.displayName) ?? "";

      const created_user = await database
        .insertInto("users")
        .values({
          bluesky_did: profile.data.did,
          bluesky_handle: profile.data.handle,
          name,
        })
        .onConflict((oc) =>
          oc.column("bluesky_did").doUpdateSet({
            name: profile.data.displayName,
            bluesky_handle: profile.data.handle,
          }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

      await setUserSession(
        event,
        {
          user: {
            id: created_user.id,
            name: created_user.name,
            bluesky: {
              did: created_user.bluesky_did,
              handle: created_user.bluesky_handle,
            },
            created_at: created_user.created_at,
            last_login_at: created_user.last_login_at,
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
