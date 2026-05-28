<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import type { Paginated } from "#shared/types/shared";

definePageMeta({ name: pages.videos_index });

const route = useRoute();
const { filters } = useVideosFilters();

const page = ref(await get_number_query_var(route, "page"));
const { data } = await useAppFetch<Paginated<VideoResource>>("/api/videos", {
  query: computed(() => ({ page: page.value, ...filters.value })),
});

watch(page, () => {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});
</script>

<template>
  <div class="mb-8 flex items-center justify-between">
    <h1 class="page-title">Vidéos de vos abonnements</h1>

    <VideosFilters />
  </div>

  <VideosList v-model:page="page" :videos="data ?? { total: 0, items: [] }" />
</template>
