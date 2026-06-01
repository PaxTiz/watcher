<script lang="ts" setup>
import { isAfter, isToday, isYesterday, subDays } from "date-fns";

import type { VideoResource } from "#shared/resources/videos";

import type { Label } from "./DashboardSectionVideosTimelineGroup.vue";

const loadMoreTrigger = ref<HTMLElement | null>(null);
const {
  items: videos,
  hasMore,
  status,
  loadMore,
} = await useInfiniteVideos(
  { per_page: 30 },
  {
    key: "home_videos_timeline",
    loadMoreTrigger,
  },
);

const groupedVideos = computed(() => {
  if (!videos.value) return [];

  const groups: Record<Label, VideoResource[]> = {
    today: [],
    yesterday: [],
    weekly: [],
    monthly: [],
    older: [],
  };

  const now = new Date();
  const weekAgo = subDays(now, 7);
  const monthAgo = subDays(now, 30);

  for (const video of videos.value) {
    const date = new Date(video.created_at);
    if (isToday(date)) {
      groups.today.push(video);
    } else if (isYesterday(date)) {
      groups.yesterday.push(video);
    } else if (isAfter(date, weekAgo)) {
      groups.weekly.push(video);
    } else if (isAfter(date, monthAgo)) {
      groups.monthly.push(video);
    } else {
      groups.older.push(video);
    }
  }

  return Object.entries(groups).filter(([_, items]) => items.length > 0) as Array<
    [Label, Array<VideoResource>]
  >;
});
</script>

<template>
  <section class="space-y-12">
    <DashboardSectionVideosTimelineGroup
      v-for="[group, items] in groupedVideos"
      :key="group"
      :label="group"
      :videos="items"
    />

    <div
      v-if="groupedVideos.length === 0 && status !== 'pending'"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <Icon name="lucide:video-off" class="text-ui-border mb-4 text-6xl" />
      <p class="text-ui-text-muted text-xl font-bold">Aucune vidéo à afficher.</p>
      <p class="text-ui-text-muted">Lancez une synchronisation pour récupérer du contenu.</p>
    </div>

    <div v-if="hasMore" ref="loadMoreTrigger" class="flex justify-center py-8">
      <div v-if="status === 'pending'" class="flex items-center gap-2">
        <Icon name="lucide:loader-2" class="size-6 animate-spin text-blue-500" />
        <span class="text-ui-text-muted">Chargement de plus de vidéos...</span>
      </div>
    </div>
  </section>
</template>
