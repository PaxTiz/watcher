import type { VideoResource } from "@watcher/common";
// @ts-ignore
import Plyr from "plyr";
import type { ShallowRef } from "vue";

const RESUME_THRESHOLD = 0.01;

export const useVideoProgression = (video: VideoResource, plyr: ShallowRef<Plyr | undefined>) => {
  if (video.viewing_progression === 1) {
    return;
  }

  watch(
    plyr,
    (instance) => {
      if (!instance) {
        return;
      }

      instance.on("ended", () =>
        callApi(`/api/videos/${video.id}/progress`, {
          method: "POST",
          body: { progression: 1 },
        }),
      );

      if (video.viewing_progression > RESUME_THRESHOLD) {
        instance.once("playing", () => {
          if (instance.currentTime < 1) {
            instance.currentTime = video.viewing_progression * instance.duration;
          }
        });
      }

      let latest_progress = 0;
      instance.on("progress", async () => {
        const progression = Number((instance.currentTime / instance.duration).toFixed(2));
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
    },
    { immediate: true },
  );
};
