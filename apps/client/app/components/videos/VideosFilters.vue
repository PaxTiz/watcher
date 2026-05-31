<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";
import type { VideosValidators } from "#shared/validators/videos";

const modelValue = defineModel<VideoFilters>({ required: true });

const { videos } = useFormatter();

const { hide = [] } = defineProps<{
  hide?: Array<VideoFilterType>;
  color?: "primary" | "secondary" | "gradient";
}>();

const format_label = <K extends VideoFilterType, V extends VideosValidators["list"]["query"][K]>(
  k: K,
  v: V,
) => {
  if (k === "service") {
    return videos.filters.service(v as VideosValidators["list"]["query"]["service"]);
  }

  if (k === "duration") {
    return videos.filters.duration(v as VideosValidators["list"]["query"]["duration"]);
  }

  if (k === "date") {
    return videos.filters.date(v as VideosValidators["list"]["query"]["date"]);
  }

  if (k === "is_favorite") {
    return videos.filters.is_favorite(v as VideosValidators["list"]["query"]["is_favorite"]);
  }

  const { data } = useNuxtData<Array<SubscriptionResource>>("subscriptions");
  return data.value?.find((e) => e.id === v)?.name ?? "N/A";
};
</script>

<template>
  <div class="text-ui-text flex flex-wrap items-center gap-2">
    <Button
      v-for="[k, v] in Object.entries(modelValue).filter(
        ([k, v]) => v !== undefined && !hide.includes(k as VideoFilterType),
      )"
      :label="format_label(k as VideoFilterType, v)"
      :tag="videos.filters.name(k as keyof typeof modelValue)"
      @click="() => (modelValue[k as VideoFilterType] = undefined)"
      allow-remove
    />

    <VideosFiltersButton v-model="modelValue" :hide="hide" :color="color" />
  </div>
</template>
