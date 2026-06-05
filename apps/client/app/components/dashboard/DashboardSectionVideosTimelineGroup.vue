<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import { useVideosFavorites } from "~/composables/videos/useVideosFavorites";
import { useVideosTimeline } from "~/composables/videos/useVideosTimeline";

export type Label = "today" | "yesterday" | "weekly" | "monthly" | "older";

const props = defineProps<{
  label: Label;
  videos: Array<VideoResource>;
}>();

const { refresh: refresh_favorites } = await useVideosFavorites();
const { refresh: refresh_timeline } = useVideosTimeline();

const formatted_label = computed(() => {
  return {
    today: "Aujourd(hui",
    yesterday: "Hier",
    weekly: "Cette semaine",
    monthly: "30 derniers jours",
    older: "Plus ancien",
  }[props.label];
});

const on_hide_subscription = async () => {
  await Promise.all([refresh_favorites(), refresh_timeline()]);
};

const on_toggle_favorite = async () => {
  await Promise.all([refresh_favorites(), refresh_timeline()]);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <h3 class="text-ui-text-muted text-lg font-bold tracking-widest uppercase">
        {{ formatted_label }}
      </h3>
      <div class="bg-ui-border h-[1px] flex-1"></div>
    </div>

    <div class="infinite-grid-[300px] gap-6">
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
  </div>
</template>
