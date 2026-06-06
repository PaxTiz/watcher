import { toast } from "vue-sonner";

export const useOAuthRedirectionHandler = () => {
  const route = useRoute();
  const router = useRouter();

  const providers: Record<string, string> = {
    bluesky: "Bluesky",
    google: "Google",
    twitch: "Twitch",
  };

  const provider = providers[route.query.provider as string];
  if (!provider) {
    return;
  }

  const state = route.query["oauth-state"] as "success" | "error";
  if (!state) {
    return;
  }

  const error = route.query.error as string;

  const messages: Record<string, string> = {
    already_linked: `Ce compte ${provider} est déjà lié à un autre compte Watcher.`,
    default_error: `Une erreur est survenue lors de la connexion à votre compte ${provider}`,
  };

  const data = {
    color: state,
    message:
      state === "success"
        ? `Votre compte ${provider} est désormais connecté`
        : (messages[error] ?? messages.default_error),
  };

  if (data.message) {
    toast[data.color](data.message);
  }

  return router.replace({
    query: {
      "oauth-state": undefined,
      provider: undefined,
      error: undefined,
    },
  });
};
