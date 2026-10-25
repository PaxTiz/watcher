<script lang="ts" setup>
import { useVideosFavorites } from "~/composables/videos/useVideosFavorites";
import { useResetVideosTimeline } from "~/composables/videos/useVideosTimeline";

const { t } = useI18n();

const { data: videos, refresh: refresh_favorites, status } = useVideosFavorites();
const reset_timeline = useResetVideosTimeline();

const on_change = async () => {
  await Promise.all([refresh_favorites(), reset_timeline()]);
};
</script>

<template>
  <VideosGridSkeleton v-if="status === 'pending' && videos?.items.length === 0" />

  <VideosRow
    v-else-if="videos && videos.items.length > 0"
    :title="t('dashboard.favorites')"
    icon="lucide:star"
    :to="{ path: '/videos', query: { is_favorite: 'true' } }"
    :videos="videos?.items ?? []"
    :loading="status === 'pending'"
    @change="on_change"
  />
</template>
