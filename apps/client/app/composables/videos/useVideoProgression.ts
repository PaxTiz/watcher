// @ts-ignore
import Plyr from "plyr";
import type { ShallowRef } from "vue";

import type { VideoResource } from "#shared/resources/videos";

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
