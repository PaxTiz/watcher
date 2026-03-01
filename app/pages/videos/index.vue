<script lang="ts" setup>
import type { Paginated } from "#shared/types/shared";
import type { VideoResource } from "#shared/resources/videos";

const route = useRoute();

const page = ref(await get_number_query_var(route, "page"));
const { data } = await useAppFetch<Paginated<VideoResource>>("/api/videos", {
  query: { page },
});

watch(page, () => {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});
</script>

<template>
  <VideosList v-model:page="page" :videos="data ?? { total: 0, items: [] }" />
</template>
