<script lang="ts" setup>
const { data: videos } = await useVideos(
  {
    page: 1,
    per_page: 9,
    is_favorite: true,
  },
  { key: "home_videos_favorites" },
);
</script>

<template>
  <section v-if="videos && videos.items.length > 0">
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
      <VideoCard v-for="video in videos.items" :key="video.id" :id="video.id" :video="video" />
    </div>
  </section>
</template>
