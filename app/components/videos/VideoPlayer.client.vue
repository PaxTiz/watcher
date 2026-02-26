<script lang="ts" setup>
import "media-chrome";

import type { VideoResource } from "#shared/resources/videos";

const { video } = defineProps<{ video: VideoResource }>();

if (video.service === "twitch") {
  await import("hls-video-element");
} else if (video.service === "youtube") {
  await import("youtube-video-element");
}

const loadPolicy = {
  default: {
    maxTimeToFirstByteMs: 30000,
    maxLoadTimeMs: 60000,
    timeoutRetry: { maxNumRetry: 3, retryDelayMs: 0, maxRetryDelayMs: 0 },
    errorRetry: { maxNumRetry: 3, retryDelayMs: 1000, maxRetryDelayMs: 8000 },
  },
};
</script>

<template>
  <media-controller class="w-full aspect-video">
    <hls-video
      v-if="video.service === 'twitch'"
      :src="`/api/videos/${video.id}/url`"
      slot="media"
      :config="{
        debug: true,
        manifestLoadPolicy: loadPolicy,
        playlistLoadPolicy: loadPolicy,
        fragLoadPolicy: loadPolicy,
        steeringManifestLoadPolicy: loadPolicy,
        certLoadPolicy: loadPolicy,
        keyLoadPolicy: loadPolicy,
      }"
      crossorigin
    >
    </hls-video>

    <youtube-video
      v-else-if="video.service === 'youtube'"
      :src="video.url"
      slot="media"
      crossorigin
    ></youtube-video>

    <media-loading-indicator slot="centered-chrome" noautohide></media-loading-indicator>
    <media-control-bar>
      <media-play-button></media-play-button>
      <media-seek-backward-button></media-seek-backward-button>
      <media-seek-forward-button></media-seek-forward-button>
      <media-mute-button></media-mute-button>
      <media-volume-range></media-volume-range>
      <media-time-range></media-time-range>
      <media-time-display showduration remaining></media-time-display>
      <media-playback-rate-button></media-playback-rate-button>
      <media-fullscreen-button></media-fullscreen-button>
    </media-control-bar>
  </media-controller>
</template>
