<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";
import "@videojs/html/i18n";
import "@videojs/html/video/player";
import "@videojs/html/video/skin";
import "@videojs/html/media/hlsjs-video";
import "@videojs/html/media/youtube-video";

import { useVideoProgression } from "~/composables/videos/useVideoProgression";

const { video, autoplay = false } = defineProps<{ video: VideoResource; autoplay?: boolean }>();
const emit = defineEmits<{ ended: [] }>();

const { locale } = useI18n();

const url = computed(() => {
  if (video.service === "twitch") {
    return `/api/videos/${video.id}/url`;
  }

  const id = new URL(video.url).searchParams.get("v");
  return `https://www.youtube-nocookie.com/embed/${id}`;
});

const media = useTemplateRef<HTMLMediaElement>("media");

useVideoProgression(video, media);
useEventListener(media, "ended", () => emit("ended"));

defineExpose({
  seek: (seconds: number) => {
    if (!media.value) {
      return;
    }

    media.value.currentTime = seconds;
    media.value.play();
  },
});
</script>

<template>
  <media-i18n :lang="locale">
    <video-player>
      <video-skin class="video-skin">
        <youtube-video
          v-if="video.service === 'youtube'"
          ref="media"
          :src="url"
          :autoplay="autoplay || undefined"
          playsinline
        />

        <hlsjs-video v-else ref="media" :src="url" :autoplay="autoplay || undefined" playsinline />
      </video-skin>
    </video-player>
  </media-i18n>
</template>

<style scoped>
.video-skin {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: var(--media-border-radius);
  /* Chrome renders <video> on a hardware overlay that ignores border-radius clipping while loading */
  clip-path: inset(0 round var(--media-border-radius));
  --media-accent-color: rgb(var(--c-vivid, 254 100 11));
  --media-accent-text-color: #fff;
  --media-border-radius: 0;
  --media-border-color: transparent;
}

@media (width >= 48rem) {
  .video-skin {
    --media-border-radius: var(--radius-2xl, 1rem);
  }
}

.video-skin :is(youtube-video, hlsjs-video) {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
}
</style>
