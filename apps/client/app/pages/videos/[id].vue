<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";

const route = useRoute();

const { data } = await useAppFetch<VideoResource>(`/api/videos/${route.params.id}`);
</script>

<template>
  <VideoPlayer :video="data!" />

  <VideoMeta :video="data!" class="mt-8" />
</template>
