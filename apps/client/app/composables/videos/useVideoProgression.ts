import type { VideoResource } from "@watcher/common";
// @ts-ignore
import Plyr from "plyr";
import type { ShallowRef } from "vue";

// Below this, there is nothing worth resuming
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

      // Duration is only reliable once playback started (especially for YouTube embeds)
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
        await usePost(
          `/api/videos/${video.id}/progress`,
          {
            method: "POST",
            body: { progression },
          },
          { immediate: true },
        );
      });
    },
    { immediate: true },
  );
};
