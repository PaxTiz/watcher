<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";
import "@videojs/html/i18n";
import "@videojs/html/video/player";
import "@videojs/html/video/skin";

import { useVideoProgression } from "~/composables/videos/useVideoProgression";

const {
  video,
  autoplay = false,
  theater = false,
} = defineProps<{ video: VideoResource; autoplay?: boolean; theater?: boolean }>();
const emit = defineEmits<{ ended: []; toggle_theater: [] }>();

const { t, locale } = useI18n();

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

const skin = useTemplateRef<HTMLElement>("skin");
const theater_slot = shallowRef<HTMLElement>();
const can_use_theater = useMediaQuery("(min-width: 80rem)");

onMounted(() => {
  const root = skin.value?.shadowRoot;
  if (!root) {
    return;
  }

  for (const gesture of root.querySelectorAll(
    'media-gesture[type="doubletap"][action="seekStep"]',
  )) {
    gesture.setAttribute("pointer", "touch");
  }

  const fullscreen_button = root.querySelector("media-fullscreen-button");
  if (fullscreen_button) {
    const slot = document.createElement("span");
    slot.style.display = "contents";
    fullscreen_button.before(slot);
    theater_slot.value = slot;
  }
});

defineExpose({
  seek: (seconds: number) => {
    if (!media.value) {
      return;
    }

    media.value.currentTime = seconds;
    media.value.play();
  },
});

await (video.service === "twitch"
  ? import("@videojs/html/media/hlsjs-video")
  : import("@videojs/html/media/youtube-video"));
</script>

<template>
  <media-i18n :lang="locale">
    <video-player>
      <video-skin ref="skin" class="video-skin" :class="{ 'is-theater': theater }">
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

  <Teleport v-if="theater_slot && can_use_theater" :to="theater_slot">
    <button
      type="button"
      class="media-button"
      :aria-label="t(theater ? 'videos.theater.exit' : 'videos.theater.enter')"
      :title="`${t(theater ? 'videos.theater.exit' : 'videos.theater.enter')} (t)`"
      @click="emit('toggle_theater')"
    >
      <svg
        class="media-button-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <rect v-if="theater" x="4" y="5" width="10" height="8" rx="1.5" />
        <rect v-else x="1.5" y="4" width="15" height="10" rx="1.5" />
      </svg>
    </button>
  </Teleport>
</template>

<style scoped>
.video-skin {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  user-select: none;
  -webkit-user-select: none;
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

@media (width >= 80rem) {
  .video-skin.is-theater {
    --media-border-radius: 0;
  }
}

.video-skin :is(youtube-video, hlsjs-video) {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
}
</style>
