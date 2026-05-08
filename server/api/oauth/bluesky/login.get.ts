import { useLogger } from "#framework";

const SESSION_DURATION = 3600 * 24 * 7; // 1 week

export default defineOAuthBlueskyEventHandler({
  config: {
    scope: ["atproto", "transition:email"],
  },

  async onSuccess(event, { user, tokens }) {
    // TODO: Récupérer les infos depuis Bluesky
    // https://docs.bsky.app/docs/api/app-bsky-actor-get-profile

    // TODO: Enregistrer l'utilisateur en base de données

    console.log(user);

    // TODO: Enregistrer la session
    await setUserSession(
      event,
      {
        user: {},
      },
      { maxAge: SESSION_DURATION },
    );

    return sendRedirect(event, "/?provider=bluesky&oauth-state=success");
  },

  onError(event, error) {
    useLogger("oauth.bluesky").error(error);

    return sendRedirect(event, "/?provider=bluesky&oauth-state=error");
  },
});
