import type { MaybePromise, VideoResource } from "@watcher/common";
import { toast } from "vue-sonner";

export const useVideo = (video: VideoResource) => {
  const { t } = useNuxtApp().$i18n;

  const on_hide_video = async (callback?: () => MaybePromise<unknown>) => {
    const ok = await useWatcherConfirm({
      title: t("videos.hide.title"),
      description: t("videos.hide.description"),
    });

    if (!ok) {
      return;
    }

    const { error } = await callApi(`/api/videos/${video.id}/hide`, { method: "POST" });
    if (error) {
      toast.error(t("videos.hide.failed"));
      return;
    }

    toast.success(t("videos.hide.success"));
    await callback?.();
  };

  const on_hide_subscription = async (callback?: () => MaybePromise<unknown>) => {
    const ok = await useWatcherConfirm({
      title: t("videos.hide_channel.title"),
      description: t("videos.hide_channel.description"),
    });

    if (!ok) {
      return;
    }

    const { error } = await callApi(`/api/subscriptions/${video.author.id}/hide`, {
      method: "POST",
    });
    if (error) {
      toast.error(t("videos.hide_channel.failed"));
      return;
    }

    toast.success(t("videos.hide_channel.success"));
    await callback?.();
  };

  const on_mark_as_read = async (on_success?: () => MaybePromise<unknown>) => {
    const { error } = await callApi(`/api/videos/${video.id}/progress`, {
      method: "POST",
      body: { progression: 1 },
    });
    if (error) {
      toast.error(t("videos.mark_as_watched.failed"));
      return;
    }

    toast.success(t("videos.mark_as_watched.success"));
    await on_success?.();
  };

  const on_toggle_subscription_favorite = async (callback?: () => MaybePromise<unknown>) => {
    const { error } = await callApi(`/api/subscriptions/${video.author.id}/favorite`, {
      method: "POST",
    });
    if (error) {
      toast.error(t("subscriptions.favorite.failed"));
      return;
    }

    if (video.author.is_favorite) {
      toast.success(t("videos.favorite.removed"));
    } else {
      toast.success(t("videos.favorite.added"));
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
