<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import type { Paginated } from "#shared/types/shared";

definePageMeta({ name: pages.videos_index });

const route = useRoute();
const { filters } = useVideosFilters();

const page = ref(await get_number_query_var(route, "page"));
const { data } = await useVideos(
  computed(() => ({ page: page.value, per_page: 21, ...filters.value })),
  { key: "videos_feed" },
);

watch(page, () => {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});
</script>

<template>
  <div class="mb-8 flex items-center justify-between">
    <h1 class="page-title">Vidéos de vos abonnements</h1>

    <div class="flex items-center gap-2">
      <AppFormInput v-model="filters.query" placeholder="Rechercher une vidéo" class="w-[250px]" />
      <VideosFilters v-model="filters" />
    </div>
  </div>

  <VideosList v-model:page="page" :videos="data ?? { total: 0, items: [] }" />
</template>
