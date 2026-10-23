import { toast } from "vue-sonner";

export type Integration = {
  id: "google" | "twitch";
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  linkUrl: string;
};

export const useIntegrations = () => {
  const { user, fetch: refresh_session } = useUserSession();
  const { t } = useNuxtApp().$i18n;

  const integrations: Array<Integration> = [
    {
      id: "google",
      name: "YouTube",
      icon: "fa7-brands:youtube",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      linkUrl: "/api/oauth/google?integration=true",
    },
    {
      id: "twitch",
      name: "Twitch",
      icon: "fa7-brands:twitch",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      linkUrl: "/api/oauth/twitch?integration=true",
    },
  ] as const;

  const is_linked = (id: Integration["id"]) => {
    if (!user.value) {
      return false;
    }

    return !!user.value.integrations[id];
  };

  const on_link = (integration: Integration) => {
    window.open(integration.linkUrl, "_self");
  };

  const on_disconnect = async (integration: Integration) => {
    const ok = await useWatcherConfirm({
      danger: true,
      title: t("integrations.disconnect.title", { name: integration.name }),
      description: t("integrations.disconnect.description"),
    });

    if (!ok) {
      return;
    }

    const { error } = await callApi(`/api/integrations/${integration.id}/disconnect`, {
      method: "DELETE",
    });

    if (error) {
      toast.error(t("integrations.disconnect.failed", { name: integration.name }));
    } else {
      await refresh_session();
      toast.success(t("integrations.disconnect.success", { name: integration.name }));
    }
  };

  return {
    integrations,

    is_linked,
    on_link,
    on_disconnect,
  };
};
