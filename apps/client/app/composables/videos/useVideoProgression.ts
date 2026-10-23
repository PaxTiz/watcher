import type { VideoResource } from "@watcher/common";
import type { ShallowRef } from "vue";

const RESUME_THRESHOLD = 0.01;

export const useVideoProgression = (
  video: VideoResource,
  media: Readonly<ShallowRef<HTMLMediaElement | null>>,
) => {
  if (video.viewing_progression === 1) {
    return;
  }

  useEventListener(media, "ended", () =>
    callApi(`/api/videos/${video.id}/progress`, {
      method: "POST",
      body: { progression: 1 },
    }),
  );

  if (video.viewing_progression > RESUME_THRESHOLD) {
    useEventListener(
      media,
      "playing",
      (event) => {
        const element = event.currentTarget as HTMLMediaElement;
        if (element.currentTime < 1) {
          element.currentTime = video.viewing_progression * element.duration;
        }
      },
      { once: true },
    );
  }

  let latest_progress = 0;
  useEventListener(media, "timeupdate", async (event) => {
    const element = event.currentTarget as HTMLMediaElement;
    if (!element.duration) {
      return;
    }

    const progression = Number((element.currentTime / element.duration).toFixed(2));
    if (latest_progress >= progression) {
      return;
    }

    latest_progress = progression;
    const { error } = await callApi(`/api/videos/${video.id}/progress`, {
      method: "POST",
      body: { progression },
    });
    if (error) {
      latest_progress = 0;
    }
  });
};
