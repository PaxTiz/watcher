<script lang="ts" setup>
import { videosValidatorsSchema } from "#shared/validators/videos";
import { useVideos } from "~/composables/videos/useVideos";
import { useVideosFilters } from "~/composables/videos/useVideosFilters";

definePageMeta({ name: pages.videos_index });

const { t } = useI18n();

const http_key = "videos_feed";
const route = useRoute();

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
    return t("videos.results_for", { query: filters.value.query });
  }

  return filters.value.is_favorite ? t("videos.favorites_title") : t("nav.videos");
});

watch(
  () => filters.value.is_favorite,
  (is_favorite) => {
    usePageNavigation()(() => [
      { label: t("nav.videos"), icon: "lucide:clapperboard", to: "/videos" },
      is_favorite ? { label: t("nav.my_favorites"), icon: "lucide:star" } : undefined,
    ]);
  },
  { immediate: true },
);

useMeta({
  title: () => t("nav.videos"),
  description: () => t("videos.description"),
});
</script>

<template>
  <div class="mb-6 space-y-4">
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="data" class="text-ui-text-muted text-sm tabular-nums">
        {{ t("videos.count", data.total) }}
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
