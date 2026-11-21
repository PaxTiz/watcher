import type { VideoResource } from "@watcher/common";
import type { ShallowRef } from "vue";

const RESUME_THRESHOLD = 5;
const SAVE_INTERVAL = 30_000;
const SEEK_DEBOUNCE = 500;

export const useVideoProgression = (
  video: VideoResource,
  media: Readonly<ShallowRef<HTMLMediaElement | null>>,
) => {
  if (video.viewing_progression === 1) {
    return;
  }

  let is_started = false;
  let saved_at = 0;
  let saved_position: number | null = video.viewing_position;

  const save = async (position: number) => {
    if (!is_started || position === saved_position) {
      return;
    }

    saved_at = Date.now();
    saved_position = position;
    const { error } = await callApi(`/api/videos/${video.id}/progress`, {
      method: "POST",
      body: { position },
      keepalive: true,
    });
    if (error) {
      saved_position = null;
    }
  };

  const save_current = async () => {
    const element = media.value;
    if (element) {
      await save(Math.round(element.currentTime));
    }
  };

  useEventListener(
    media,
    "playing",
    (event) => {
      const element = event.currentTarget as HTMLMediaElement;
      if (video.viewing_position > RESUME_THRESHOLD && element.currentTime < 1) {
        element.currentTime = video.viewing_position;
      }

      is_started = true;
      saved_at = Date.now();
    },
    { once: true },
  );

  useEventListener(media, "timeupdate", async () => {
    if (Date.now() - saved_at >= SAVE_INTERVAL) {
      await save_current();
    }
  });

  useEventListener(media, "pause", save_current);
  useEventListener(media, "seeked", useDebounceFn(save_current, SEEK_DEBOUNCE));
  useEventListener(media, "ended", () => save(video.duration));

  useEventListener(window, "pagehide", save_current);
  useEventListener(document, "visibilitychange", async () => {
    if (document.visibilityState === "hidden") {
      await save_current();
    }
  });

  onBeforeUnmount(save_current);
};
