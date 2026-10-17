<script lang="ts" setup>
import { useVideosFavorites } from "~/composables/videos/useVideosFavorites";
import { useVideosTimeline } from "~/composables/videos/useVideosTimeline";

const { data: videos, refresh: refresh_favorites, status } = await useVideosFavorites();
const { refresh: refresh_timeline } = useVideosTimeline();

const on_change = async () => {
  await Promise.all([refresh_favorites(), refresh_timeline()]);
};
</script>

<template>
  <VideosRow
    v-if="status === 'pending' || (videos && videos.items.length > 0)"
    title="Nouveautés de vos favoris"
    icon="lucide:star"
    :to="{ path: '/videos', query: { is_favorite: 'true' } }"
    :videos="videos?.items ?? []"
    :loading="status === 'pending'"
    @change="on_change"
  />
</template>
