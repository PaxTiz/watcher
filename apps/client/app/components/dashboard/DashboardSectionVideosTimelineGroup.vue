<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";

import { useVideosFavorites } from "~/composables/videos/useVideosFavorites";
import { useVideosTimeline } from "~/composables/videos/useVideosTimeline";

export type Label = "today" | "yesterday" | "weekly" | "monthly" | "older";

const props = defineProps<{
  label: Label;
  videos: Array<VideoResource>;
}>();

const { refresh: refresh_favorites } = await useVideosFavorites();

const formatted_label = computed(() => {
  return {
    today: "Aujourd'hui",
    yesterday: "Hier",
    weekly: "Cette semaine",
    monthly: "30 derniers jours",
    older: "Plus ancien",
  }[props.label];
});

const on_hide_subscription = async () => {
  await refresh_favorites();
};

const on_toggle_favorite = async () => {
  await refresh_favorites();
};
</script>

<template>
  <section class="space-y-4">
    <h2 class="font-display text-ui-text text-lg font-semibold">
      {{ formatted_label }}
    </h2>

    <div class="infinite-grid-[300px] gap-x-4 gap-y-8">
      <VideoCard
        v-for="video in videos"
        :key="video.id"
        :id="video.id"
        :video="video"
        @hide-video="refresh_favorites"
        @hide-subscription="on_hide_subscription"
        @toggle-favorite="on_toggle_favorite"
      />
    </div>
  </section>
</template>
