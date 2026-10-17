<script lang="ts" setup>
import { videosValidatorsSchema } from "#shared/validators/videos";
import { useVideos } from "~/composables/videos/useVideos";
import { useVideosFilters } from "~/composables/videos/useVideosFilters";

definePageMeta({ name: pages.videos_index });

const http_key = "videos_feed";
const route = useRoute();

// Filters can come from the URL (global search, sidebar "Favoris" link, shared link..)
const parse_route_filters = async () => {
  const parsed = videosValidatorsSchema.list.query.safeParse({
    ...route.query,
    page: await get_number_query_var(route, "page"),
    per_page: 21,
  });

  return parsed.success ? parsed.data : { page: 1, per_page: 21 };
};

const { filters } = useVideosFilters(await parse_route_filters());
const { data, status } = await useVideos(filters, { key: http_key });

watch(
  () => [route.query.query, route.query.is_favorite],
  async () => {
    const route_filters = await parse_route_filters();

    if (route_filters.query !== filters.value.query) {
      filters.value.query = route_filters.query;
    }
    if (route_filters.is_favorite !== filters.value.is_favorite) {
      filters.value.is_favorite = route_filters.is_favorite;
    }
  },
);

const title = computed(() => {
  if (filters.value.query) {
    return `Résultats pour « ${filters.value.query} »`;
  }

  return filters.value.is_favorite ? "Vidéos de vos favoris" : "Vidéos";
});

useMeta({
  title: "Vidéos",
  description: "Explorez l'ensemble des vidéos de vos abonnements YouTube et Twitch.",
});
</script>

<template>
  <div class="mb-6 space-y-4">
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="data" class="text-ui-text-muted text-sm tabular-nums">
        {{ data.total }} vidéo{{ data.total > 1 ? "s" : "" }}
      </p>
    </div>

    <VideosFilters v-model="filters" />
  </div>

  <VideosGrid
    v-model:page="filters.page"
    :per-page="filters.per_page"
    :videos="data ?? { total: 0, items: [] }"
    :loading="status === 'pending'"
    :http-key="http_key"
  />
</template>
