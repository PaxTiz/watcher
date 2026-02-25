<script lang="ts" setup>
import "media-chrome";
import "hls-video-element";

const { id } = defineProps<{ id: number }>();

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
      :src="`/api/videos/${id}/url`"
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
      muted
    >
    </hls-video>

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
