import { toast } from "vue-sonner";

import { LazyLoginModal } from "#components";

export type Integration = {
  id: "google" | "twitch" | "bluesky";
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  linkUrl: string;
};

export const useIntegrations = () => {
  const { user, fetch } = useUserSession();

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
    {
      id: "bluesky",
      name: "Bluesky",
      icon: "fa7-brands:bluesky",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      linkUrl: "/api/oauth/bluesky?integration=true",
    },
  ] as const;

  const is_linked = (id: Integration["id"]) => {
    if (!user.value) {
      return false;
    }

    return !!user.value.integrations[id];
  };

  const on_link = (integration: Integration) => {
    if (integration.id !== "bluesky") {
      window.open(integration.linkUrl, "_self");
    } else {
      useOverlay().create(LazyLoginModal).open({
        title: "Lier mon compte Bluesky",
        description:
          "Saisissez votre identifiant Bluesky pour vous connecter et lier votre compte.",
        button: "Lier mon compte",
        link: true,
      });
    }
  };

  const on_disconnect = async (integration: Integration) => {
    const ok = await useConfirm({
      title: `Déconnexion de votre compte ${integration.name}`,
      description:
        "Si vous déconnectez votre compte, vos abonnements ainsi que les vidéos liées à vos abonnements ne seront plus mis à jour.",
    });

    if (!ok) {
      return;
    }

    const { error } = usePost(
      `/api/integrations/${integration.id}/disconnect`,
      {
        method: "DELETE",
      },
      { immediate: true },
    );

    if (error.value) {
      toast.error(`Une erreur est survenue lors de la déconnexion de ${integration.name}`);
    } else {
      await fetch();
      toast.success(`Le compte ${integration.name} a été déconnecté`);
    }
  };

  return {
    integrations,

    is_linked,
    on_link,
    on_disconnect,
  };
};
