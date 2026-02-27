<script lang="ts" setup>
import type { Paginated } from "#shared/types/shared";
import type { VideoResource } from "#shared/resources/videos";

const { data } = await useAppFetch<Paginated<VideoResource>>("/api/videos");
</script>

<template>
  <VideosList :videos="data ?? { total: 0, items: [] }" />
</template>
