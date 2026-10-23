import type { MaybePromise, VideoResource } from "@watcher/common";
import { toast } from "vue-sonner";

export const useVideo = (video: VideoResource) => {
  const on_hide_video = async (callback?: () => MaybePromise<unknown>) => {
    const ok = await useWatcherConfirm({
      title: "Masquer une vidéo",
      description:
        "Voulez-vous vraiment masquer cette vidéo ? Elle n'apparaîtra plus dans votre flux.",
      confirmLabel: "Confirmer",
      cancelLabel: "Annuler",
    });

    if (!ok) {
      return;
    }

    const { error } = await callApi(`/api/videos/${video.id}/hide`, { method: "POST" });
    if (error) {
      toast.error("Le masquage de la vidéo a échoué, réessayez plus tard");
      return;
    }

    toast.success("La vidéo a été masquée");
    await callback?.();
  };

  const on_hide_subscription = async (callback?: () => MaybePromise<unknown>) => {
    const ok = await useWatcherConfirm({
      title: "Masquer une chaîne",
      description:
        "Voulez-vous vraiment masquer cette chaîne ? L'historique ainsi que les nouvelles vidéos publiées par cette chaîne ne seront plus visibles dans votre flux.",
      confirmLabel: "Confirmer",
      cancelLabel: "Annuler",
    });

    if (!ok) {
      return;
    }

    const { error } = await callApi(`/api/subscriptions/${video.author.id}/hide`, {
      method: "POST",
    });
    if (error) {
      toast.error("Le masquage de la chaîne a échoué, réessayez plus tard");
      return;
    }

    toast.success("La chaîne a été masquée");
    await callback?.();
  };

  const on_mark_as_read = async (on_success?: () => MaybePromise<unknown>) => {
    const { error } = await callApi(`/api/videos/${video.id}/progress`, {
      method: "POST",
      body: { progression: 1 },
    });
    if (error) {
      toast.error("La vidéo n'a pas pu être marquée comme vue, réessayez plus tard");
      return;
    }

    toast.success("La vidéo a été marquée comme vue");
    await on_success?.();
  };

  const on_toggle_subscription_favorite = async (callback?: () => MaybePromise<unknown>) => {
    const { error } = await callApi(`/api/subscriptions/${video.author.id}/favorite`, {
      method: "POST",
    });
    if (error) {
      toast.error("La modification de vos favoris a échoué, réessayez plus tard");
      return;
    }

    if (video.author.is_favorite) {
      toast.success("L'abonnement a été retiré de vos favoris");
    } else {
      toast.success("L'abonnement a été ajouté à vos favoris");
    }

    await callback?.();
  };

  return {
    on_hide_video,
    on_hide_subscription,
    on_mark_as_read,
    on_toggle_subscription_favorite,
  };
};
