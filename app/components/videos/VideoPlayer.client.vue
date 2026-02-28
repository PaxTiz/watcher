<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import Hls from "hls.js";

// @ts-ignore
import Plyr from "plyr";
import "plyr/css";

const { video } = defineProps<{ video: VideoResource }>();

const url = computed(() => {
  if (video.service === "twitch") {
    return `/api/videos/${video.id}/url`;
  }

  const splitter = video.url.indexOf("v=");
  const id = video.url.slice(splitter + 2);
  return `https://www.youtube.com/embed/${id}`;
});

const player = useTemplateRef("player");
const defaultOptions: Record<string, unknown> = {
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
      new Plyr(p, defaultOptions);
    }

    const videoElement = p.querySelector("video")!;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url.value);

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const availableQualities = hls.levels.map((l) => l.height);
        availableQualities.unshift(0);

        defaultOptions.quality = {
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

        defaultOptions.i18n = {
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

        new Plyr(videoElement, defaultOptions);
      });

      hls.attachMedia(videoElement);
    } else {
      videoElement.src = url.value;
      new Plyr(videoElement, defaultOptions);
    }
  },
  { deep: true, flush: "post" },
);
</script>

<template>
  <div class="relative">
    <div ref="player" class="plyr__video-embed" id="player">
      <iframe
        v-if="video.service === 'youtube'"
        :src="url"
        allowfullscreen
        allowtransparency
        allow="autoplay"
        class="aspect-video"
      ></iframe>

      <video v-else class="aspect-video" playsinline controls></video>
    </div>
  </div>
</template>
