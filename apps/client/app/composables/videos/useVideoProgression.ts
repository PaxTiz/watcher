import type { VideoResource } from "@watcher/common";
import type { ShallowRef } from "vue";

const RESUME_THRESHOLD = 0.005;
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
  let saved_progression: number | null = video.viewing_progression;

  const save = async (progression: number) => {
    if (!is_started || progression === saved_progression) {
      return;
    }

    saved_at = Date.now();
    saved_progression = progression;
    const { error } = await callApi(`/api/videos/${video.id}/progress`, {
      method: "POST",
      body: { progression },
      keepalive: true,
    });
    if (error) {
      saved_progression = null;
    }
  };

  const save_current = async () => {
    const element = media.value;
    if (element?.duration) {
      await save(Number((element.currentTime / element.duration).toFixed(4)));
    }
  };

  useEventListener(
    media,
    "playing",
    (event) => {
      const element = event.currentTarget as HTMLMediaElement;
      if (video.viewing_progression > RESUME_THRESHOLD && element.currentTime < 1) {
        element.currentTime = video.viewing_progression * element.duration;
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
  useEventListener(media, "ended", () => save(1));

  useEventListener(window, "pagehide", save_current);
  useEventListener(document, "visibilitychange", async () => {
    if (document.visibilityState === "hidden") {
      await save_current();
    }
  });

  onBeforeUnmount(save_current);
};
