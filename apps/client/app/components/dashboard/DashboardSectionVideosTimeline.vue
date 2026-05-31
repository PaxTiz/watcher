<script lang="ts" setup>
import { isAfter, isToday, isYesterday, subDays } from "date-fns";

import type { VideoResource } from "#shared/resources/videos";

import type { Label } from "./DashboardSectionVideosTimelineGroup.vue";

const { data: videos } = await useVideos(
  { page: 1, per_page: 30 },
  { key: "home_videos_timeline" },
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

  for (const video of videos.value.items) {
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
      v-if="groupedVideos.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <Icon name="lucide:video-off" class="text-ui-border mb-4 text-6xl" />
      <p class="text-ui-text-muted text-xl font-bold">Aucune vidéo à afficher.</p>
      <p class="text-ui-text-muted">Lancez une synchronisation pour récupérer du contenu.</p>
    </div>

    <div v-if="groupedVideos.length > 0" class="my-8 flex justify-center">
      <Button label="Accéder à toute la bibliothèque" to="/videos" size="lg" />
    </div>
  </section>
</template>
