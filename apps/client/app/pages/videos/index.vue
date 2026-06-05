<script lang="ts" setup>
import { useVideos } from "~/composables/videos/useVideos";
import { useVideosFilters } from "~/composables/videos/useVideosFilters";

definePageMeta({ name: pages.videos_index });

const http_key = "videos_feed";
const route = useRoute();
const page = ref(await get_number_query_var(route, "page"));

const { filters } = useVideosFilters({ page: page.value, per_page: 21 });
const { data, status } = await useVideos(filters, { key: http_key });

useMeta({
  title: "Vidéos",
  description: "Explorez l'ensemble des vidéos de vos abonnements YouTube et Twitch.",
});
</script>

<template>
  <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <h1 class="page-title">Vidéos de vos abonnements</h1>

    <div class="flex items-center gap-2">
      <AppFormInput
        v-model="filters.query"
        placeholder="Rechercher une vidéo"
        class="flex-1 md:w-[250px]"
      />
      <VideosFilters v-model="filters" />
    </div>
  </div>

  <VideosGrid
    v-model:page="filters.page"
    :per-page="filters.per_page"
    :videos="data ?? { total: 0, items: [] }"
    :loading="status === 'pending'"
    :http-key="http_key"
  />
</template>
