import { toast } from "vue-sonner";

export const useOAuthRedirectionHandler = () => {
  const route = useRoute();
  const router = useRouter();
  const { t } = useNuxtApp().$i18n;

  const providers: Record<string, string> = {
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
    already_linked: t("integrations.oauth.already_linked", { provider }),
    default_error: t("integrations.oauth.failed", { provider }),
  };

  const data = {
    color: state,
    message:
      state === "success"
        ? t("integrations.oauth.success", { provider })
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
