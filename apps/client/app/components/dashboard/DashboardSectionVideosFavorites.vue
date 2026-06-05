<script lang="ts" setup>
import { useVideosFavorites } from "~/composables/videos/useVideosFavorites";
import { useVideosTimeline } from "~/composables/videos/useVideosTimeline";

const { data: videos, refresh: refresh_favorites, status } = await useVideosFavorites();
const { refresh: refresh_timeline } = useVideosTimeline();

const on_hide_subscription = async () => {
  await Promise.all([refresh_favorites(), refresh_timeline()]);
};

const on_toggle_favorite = async () => {
  await Promise.all([refresh_favorites(), refresh_timeline()]);
};
</script>

<template>
  <VideosGridSkeleton v-if="status === 'pending'" />

  <section v-else-if="videos && videos.items.length > 0">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-ui-text flex items-center gap-2 text-xl font-bold">
        <Icon name="lucide:star" class="text-yellow-500" />
        Vos Favoris
      </h2>

      <nuxt-link to="/videos?favorite=true" class="text-alt text-sm font-bold hover:underline">
        Voir tout
      </nuxt-link>
    </div>

    <div class="infinite-grid-[300px] gap-6">
      <VideoCard
        v-for="video in videos.items"
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
