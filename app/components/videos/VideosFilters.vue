<script lang="ts" setup>
const { videos } = useFormatter();
const { filters } = useVideosFilters();
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 text-ui-text">
    <Button
      v-for="[k, v] in Object.entries(filters).filter(([_, v]) => !!v)"
      :label="videos.filters[k as VideoFilterType](v as any)"
      :tag="videos.filters.name(k)"
      @click="() => filters[k as VideoFilterType] = undefined"
      allow-remove
    />

    <VideosFiltersButton />
  </div>
</template>
