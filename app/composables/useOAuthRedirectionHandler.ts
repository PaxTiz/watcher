import { toast } from "vue-sonner";

export const useOAuthRedirectionHandler = () => {
  const route = useRoute();
  const router = useRouter();

  const providers: Record<string, string> = {
    bluesky: "BlueSky",
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

  const data = {
    color: state,
    message:
      state === "success"
        ? `Votre compte ${provider} est désormais connecté`
        : `Une erreur est survenue lors de la connexion à votre compte ${provider}`,
  };

  toast[data.color](data.message);

  return router.replace({ query: { provider: undefined, "oauth-state": undefined } });
};
