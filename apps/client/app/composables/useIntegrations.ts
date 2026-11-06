import { toast } from "vue-sonner";

export type Integration = {
  id: "google" | "twitch";
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  linkUrl: string;
  reauthenticateUrl: string;
};

export const useIntegrations = () => {
  const { user, fetch: refresh_session } = useUserSession();
  const { t } = useNuxtApp().$i18n;
  const { confirm_identity } = useReauthentication();

  const integrations: Array<Integration> = [
    {
      id: "google",
      name: "YouTube",
      icon: "fa7-brands:youtube",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      linkUrl: "/api/oauth/google?integration=true",
      reauthenticateUrl: "/api/oauth/google?reauthenticate=true",
    },
    {
      id: "twitch",
      name: "Twitch",
      icon: "fa7-brands:twitch",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      linkUrl: "/api/oauth/twitch?integration=true",
      reauthenticateUrl: "/api/oauth/twitch?reauthenticate=true",
    },
  ] as const;

  const is_linked = (id: Integration["id"]) => {
    if (!user.value) {
      return false;
    }

    return !!user.value.integrations[id];
  };

  const on_link = async (integration: Integration) => {
    if (await confirm_identity()) {
      window.open(integration.linkUrl, "_self");
    }
  };

  const on_disconnect = async (integration: Integration) => {
    const ok = await useWatcherConfirm({
      danger: true,
      title: t("integrations.disconnect.title", { name: integration.name }),
      description: t("integrations.disconnect.description"),
    });

    if (!ok || !(await confirm_identity())) {
      return;
    }

    const { error } = await callApi(`/api/integrations/${integration.id}/disconnect`, {
      method: "DELETE",
    });

    if (error) {
      toast.error(
        t(
          error.message === "last_login_method"
            ? "integrations.disconnect.last_login_method"
            : "integrations.disconnect.failed",
          { name: integration.name },
        ),
      );
    } else {
      await refresh_session();
      toast.success(t("integrations.disconnect.success", { name: integration.name }));
    }
  };

  const integration_data = (_id: Integration["id"] | "youtube") => {
    const id = _id === "youtube" ? "google" : _id;
    const data = integrations.find((e) => e.id === id);
    if (!data) {
      throw new Error(`Integration ${id} not found`);
    }

    return data;
  };

  return {
    integrations,
    integration_data,

    is_linked,
    on_link,
    on_disconnect,
  };
};
