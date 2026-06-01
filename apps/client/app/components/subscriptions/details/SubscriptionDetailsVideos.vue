<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

const { subscription } = defineProps<{ subscription: SubscriptionResource }>();

const { filters } = useVideosFilters({ subscription_id: subscription.id });

const page = ref(1);
const { data: videos, status } = await useVideos(
  computed(() => ({
    page: page.value,
    per_page: 15,
    ...filters.value,
  })),
  { key: `subscription_${subscription.id}_videos` },
);

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

    <VideosList
      v-model:page="page"
      :videos="videos ?? { total: 0, items: [] }"
      :loading="status === 'pending'"
      :allow-hide-channel="false"
    />
  </div>
</template>
