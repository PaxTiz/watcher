<script lang="ts" setup>
import type { SubscriptionResource } from "@watcher/common";

import { useVideos } from "~/composables/videos/useVideos";
import { useVideosFilters } from "~/composables/videos/useVideosFilters";

const { subscription } = defineProps<{ subscription: SubscriptionResource }>();

const { t } = useI18n();
const route = useRoute();

const { filters, filters_debounced } = useVideosFilters(
  {
    page: await get_number_query_var(route, "page"),
    per_page: 20,
    subscription_id: subscription.id,
  },
  ["subscription_id"],
);

const http_key = computed(() => `subscription_${subscription.id}_videos`);
const { data: videos, status } = await useVideos(filters_debounced, { key: http_key });

usePageAmbient(() => videos.value?.items[0]);

onUnmounted(() => {
  filters.value.subscription_id = undefined;
});
</script>

<template>
  <div class="space-y-10">
    <SubscriptionDetailsHeader
      :subscription="subscription"
      :total-videos="videos?.total"
      :palette="videos?.items[0]?.palette"
    />

    <section>
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-display text-ui-text text-base font-medium">{{ t("nav.videos") }}</h2>

        <div class="flex flex-1 items-center justify-end gap-2">
          <label class="group relative flex w-full max-w-xs items-center">
            <span class="sr-only">
              {{ t("subscriptions.search_in_label", { name: subscription.name }) }}
            </span>
            <Icon
              name="lucide:search"
              class="text-ui-text-muted group-focus-within:text-alt pointer-events-none absolute left-3.5 text-sm"
            />
            <input
              v-model="filters.query"
              type="search"
              :placeholder="t('subscriptions.search_in', { name: subscription.name })"
              class="control-field w-full !rounded-full !pl-9"
            />
          </label>
          <VideosFilters v-model="filters" :hide="['service', 'is_favorite']" />
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
    </section>
  </div>
</template>
