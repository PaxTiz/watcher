<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";
import type { VideoResource } from "#shared/resources/videos";

const { subscription } = defineProps<{ subscription: SubscriptionResource }>();

const { filters } = useVideosFilters();
filters.value.subscription_id = subscription.id;
filters.value.service = undefined;

const page = ref(1);
const query = ref("");
const { data: videos } = await useAppFetch<Paginated<VideoResource>>("/api/videos", {
  query: computed(() => ({
    page: page.value,
    ...filters.value,
    subscription_id: subscription.id,
  })),
});

watch(page, () => {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

onUnmounted(() => {
  filters.value.subscription_id = undefined;
});
</script>

<template>
  <div class="border-ui-border mb-10 border-t pt-10">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-ui-text-strong text-2xl font-bold">Vidéos publiées</h2>

      <div class="flex items-center gap-2">
        <AppFormInput v-model="query" placeholder="Rechercher une vidéo" class="w-[250px]" />
        <VideosFilters :hide="['subscription_id', 'service', 'is_favorite']" />
      </div>
    </div>

    <VideosList v-model:page="page" :videos="videos ?? { total: 0, items: [] }" />
  </div>
</template>
