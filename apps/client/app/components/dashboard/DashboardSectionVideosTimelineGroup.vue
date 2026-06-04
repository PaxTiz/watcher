<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";

export type Label = "today" | "yesterday" | "weekly" | "monthly" | "older";

const props = defineProps<{
  label: Label;
  videos: Array<VideoResource>;
}>();

const formatted_label = computed(() => {
  return {
    today: "Aujourd(hui",
    yesterday: "Hier",
    weekly: "Cette semaine",
    monthly: "30 derniers jours",
    older: "Plus ancien",
  }[props.label];
});
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
      <VideoCard v-for="video in videos" :key="video.id" :id="video.id" :video="video" />
    </div>
  </div>
</template>
