<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";
import Hls from "hls.js";
// @ts-ignore
import Plyr from "plyr";
// @ts-ignore
import "plyr/css";

import { useVideoProgression } from "~/composables/videos/useVideoProgression";

const { video, autoplay = false } = defineProps<{ video: VideoResource; autoplay?: boolean }>();
const emit = defineEmits<{ ended: [] }>();

const url = computed(() => {
  if (video.service === "twitch") {
    return `/api/videos/${video.id}/url`;
  }

  const splitter = video.url.indexOf("v=");
  const id = video.url.slice(splitter + 2);
  return `https://www.youtube.com/embed/${id}`;
});

const player = useTemplateRef("player");
const plyr_instance = shallowRef<Plyr>();

const plyrOptions: Record<string, unknown> = {
  ratio: "unset",
  autoplay,
  settings: ["captions", "quality", "speed", "loop"],
  keyboard: {
    focused: true,
    global: true,
  },
  youtube: {
    rel: 0,
    noCookie: true,
    modestbranding: 1,
  },
};

watch(
  () => player.value,
  (p) => {
    if (!p) {
      return;
    }

    if (video.service === "youtube") {
      plyr_instance.value = new Plyr(p, plyrOptions);
    }

    const videoElement = p.querySelector("video")!;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url.value);

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const availableQualities = hls.levels.map((l) => l.height);
        availableQualities.unshift(0);

        plyrOptions.quality = {
          default: 0,
          options: availableQualities,
          forced: true,
          onChange: (newQuality: number) => {
            if (newQuality === 0) {
              hls.currentLevel = -1;
            } else {
              hls.levels.forEach((level, index) => {
                if (level.height === newQuality) {
                  hls.currentLevel = index;
                }
              });
            }
          },
        };

        plyrOptions.i18n = {
          qualityLabel: { 0: "Auto" },
        };

        hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
          const span = document.querySelector(
            ".plyr__menu__container [data-plyr='quality'][value='0'] span",
          );
          if (span) {
            span.innerHTML = hls.autoLevelEnabled
              ? `AUTO (${hls.levels[data.level]?.height}p)`
              : "AUTO";
          }
        });

        plyr_instance.value = new Plyr(videoElement, plyrOptions);
      });

      hls.attachMedia(videoElement);
    } else {
      videoElement.src = url.value;
      plyr_instance.value = new Plyr(videoElement, plyrOptions);
    }
  },
  { deep: true, flush: "post" },
);

useVideoProgression(video, plyr_instance);

const controls = shallowRef<HTMLElement | null>(null);
useLiquidGlass(controls);

watch(plyr_instance, (instance) => {
  instance?.on("ended", () => emit("ended"));

  // Plyr builds its own controls: they become a floating glass capsule
  const element = (instance as { elements?: { controls?: HTMLElement } } | undefined)?.elements
    ?.controls;
  if (element) {
    element.classList.add("liquid-glass");
    controls.value = element;
  }
});

defineExpose({
  seek: (seconds: number) => {
    if (!plyr_instance.value) {
      return;
    }

    plyr_instance.value.currentTime = seconds;
    plyr_instance.value.play();
  },
});
</script>

<template>
  <div class="relative aspect-video bg-black">
    <div class="size-full">
      <div ref="player" class="plyr__video-embed" id="player">
        <iframe
          v-if="video.service === 'youtube'"
          :src="url"
          allowfullscreen
          allowtransparency
          allow="autoplay"
        ></iframe>

        <video v-else playsinline controls></video>
      </div>
    </div>
  </div>
</template>

<style scoped>
.size-full :deep(.plyr) {
  height: 100%;
  --plyr-color-main: rgb(var(--c-vivid, 254 100 11));
  --plyr-video-control-background-hover: rgb(255 255 255 / 0.16);
  --plyr-range-thumb-background: #fff;
}

.size-full :deep(.plyr--video .plyr__controls) {
  left: 12px;
  right: 12px;
  bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background-image: none;
  color: #fff;
}

.size-full :deep(.plyr__control--overlaid) {
  background: rgb(var(--c-dark, 16 18 27) / 0.55);
  backdrop-filter: blur(10px);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25);
}
</style>
