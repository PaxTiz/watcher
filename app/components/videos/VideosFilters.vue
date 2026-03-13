<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";
import type { VideosValidators } from "#shared/validators/videos";

const { videos } = useFormatter();
const { filters } = useVideosFilters();

const format_label = <K extends VideoFilterType, V extends VideosValidators["list"]["query"][K]>(
  k: K,
  v: V,
) => {
  if (k === "service") {
    return videos.filters.service(v);
  }

  if (k === "duration") {
    return videos.filters.duration(v);
  }

  if (k === "date") {
    return videos.filters.date(v);
  }

  const { data } = useNuxtData<Array<SubscriptionResource>>("subscriptions");
  return data.value?.find((e) => e.id === v)?.name ?? "N/A";
};
</script>

<template>
  <div class="text-ui-text flex flex-wrap items-center gap-2">
    <Button
      v-for="[k, v] in Object.entries(filters).filter(([_, v]) => !!v)"
      :label="format_label(k as VideoFilterType, v)"
      :tag="videos.filters.name(k)"
      @click="() => (filters[k as VideoFilterType] = undefined)"
      allow-remove
    />

    <VideosFiltersButton />
  </div>
</template>
