import type { MaybePromise } from "@watcher/types";
import { toast } from "vue-sonner";

import type { VideoResource } from "#shared/resources/videos";

export const useVideo = (video: VideoResource) => {
  const { error: video_progress_error, execute: video_progress } = usePost(
    `/api/videos/${video.id}/progress`,
    {
      method: "POST",
      body: { progression: 1 },
    },
  );

  const { error: video_hide_error, execute: video_hide } = usePost(`/api/videos/${video.id}/hide`, {
    method: "POST",
  });

  const { error: video_subscription_hide_error, execute: video_subscription_hide } = usePost(
    `/api/subscriptions/${video.author.id}/hide`,
    {
      method: "POST",
    },
  );

  const { error: video_subscription_favorite_error, execute: video_subscription_favorite } =
    usePost(`/api/subscriptions/${video.author.id}/favorite`, {
      method: "POST",
    });

  const on_hide_video = async (callback?: () => MaybePromise<unknown>) => {
    const ok = await useConfirm({
      title: "Masquer une vidéo",
      description:
        "Voulez-vous vraiment masquer cette vidéo ? Elle n'apparaîtra plus dans votre flux.",
    });

    if (ok) {
      await video_hide();

      if (!video_hide_error.value) {
        toast.success("La vidéo a été masquée");
        await callback?.();
      }
    }
  };

  const on_hide_subscription = async (callback?: () => MaybePromise<unknown>) => {
    const ok = await useConfirm({
      title: "Masquer une chaîne",
      description:
        "Voulez-vous vraiment masquer cette chaîne ? L'historique ainsi que les nouvelles vidéos publiées par cette chaîne ne seront plus visibles dans votre flux.",
    });

    if (ok) {
      await video_subscription_hide();

      if (!video_subscription_hide_error.value) {
        toast.success("La chaîne a été masquée");
        await callback?.();
      }
    }
  };

  const on_mark_as_read = async (on_success?: () => MaybePromise<unknown>) => {
    await video_progress();

    if (!video_progress_error.value) {
      toast.success("La vidéo a été marquée comme vue");

      await on_success?.();
    }
  };

  const on_toggle_subscription_favorite = async (callback?: () => MaybePromise<unknown>) => {
    await video_subscription_favorite();

    if (!video_subscription_favorite_error.value) {
      if (video.author.is_favorite) {
        toast.success("L'abonnement a été retiré de vos favoris");
      } else {
        toast.success("L'abonnement a été ajouté à vos favoris");
      }

      await callback?.();
    }
  };

  return {
    on_hide_video,
    on_hide_subscription,
    on_mark_as_read,
    on_toggle_subscription_favorite,
  };
};
