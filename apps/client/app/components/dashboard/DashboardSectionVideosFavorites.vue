<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";

const { data: favoriteVideos, refresh: refreshFavorites } = await useAppFetch<
  Paginated<VideoResource>
>("/api/videos", {
  query: { page: 1, is_favorite: true },
});
</script>

<template>
  <section v-if="favoriteVideos && favoriteVideos.items.length > 0">
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
        v-for="video in favoriteVideos.items.slice(0, 4)"
        :key="video.id"
        :id="video.id"
        :video="video"
        class="!border-ui-border/50"
      />
    </div>
  </section>
</template>
