<script lang="ts" setup>
import "media-chrome";
import "media-chrome/menu";
import "media-chrome/lang/fr.js";

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
  <media-controller
    lang="fr"
    defaultsubtitles="false"
    defaultstreamtype="on-demand"
    class="w-full aspect-video"
  >
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
      ref="video"
      v-else-if="video.service === 'youtube'"
      :src="video.url"
      :config="{
        cc_load_policy: 0, // Disable default subtitles
        rel: 0, // Don't show recommendations at end of video
      }"
      slot="media"
    ></youtube-video>

    <media-settings-menu hidden anchor="auto">
      <media-settings-menu-item>
        Vitesse
        <media-playback-rate-menu slot="submenu" hidden>
          <div slot="title">Speed</div>
        </media-playback-rate-menu>
      </media-settings-menu-item>

      <media-settings-menu-item>
        Qualité
        <media-rendition-menu slot="submenu" hidden>
          <div slot="title">Quality</div>
        </media-rendition-menu>
      </media-settings-menu-item>

      <media-settings-menu-item>
        Sous-titres
        <media-captions-menu slot="submenu" hidden>
          <div slot="title">Captions</div>
        </media-captions-menu>
      </media-settings-menu-item>
    </media-settings-menu>

    <media-control-bar>
      <media-play-button></media-play-button>
      <media-seek-backward-button></media-seek-backward-button>
      <media-seek-forward-button></media-seek-forward-button>
      <media-mute-button></media-mute-button>
      <media-volume-range></media-volume-range>
      <media-time-range></media-time-range>
      <media-time-display showduration remaining></media-time-display>

      <media-settings-menu-button></media-settings-menu-button>
      <media-fullscreen-button></media-fullscreen-button>
    </media-control-bar>
  </media-controller>
</template>
