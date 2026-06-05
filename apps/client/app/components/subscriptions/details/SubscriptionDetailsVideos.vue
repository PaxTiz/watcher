<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";
import { useVideos } from "~/composables/videos/useVideos";
import { useVideosFilters } from "~/composables/videos/useVideosFilters";

const { subscription } = defineProps<{ subscription: SubscriptionResource }>();

const { filters } = useVideosFilters({ page: 1, per_page: 15, subscription_id: subscription.id }, [
  "subscription_id",
]);

const http_key = computed(() => `subscription_${subscription.id}_videos`);
const { data: videos, status } = await useVideos(filters, { key: http_key });

onUnmounted(() => {
  filters.value.subscription_id = undefined;
});
</script>

<template>
  <div class="border-ui-border mb-10 border-t pt-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h2 class="text-ui-text-strong text-2xl font-bold">Vidéos publiées</h2>

      <div class="flex items-center gap-2">
        <AppFormInput
          v-model="filters.query"
          placeholder="Rechercher une vidéo"
          class="flex-1 md:w-[250px]"
        />
        <VideosFilters v-model="filters" :hide="['subscription_id', 'service', 'is_favorite']" />
      </div>
    </div>

    <VideosGrid
      v-model:page="filters.page"
      :per-page="filters.per_page"
      :videos="videos ?? { total: 0, items: [] }"
      :loading="status === 'pending'"
      :allow-hide-channel="false"
      :allow-toggle-favorite="false"
      :http-key="http_key"
    />
  </div>
</template>
