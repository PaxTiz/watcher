<script lang="ts" setup>
import type { Paginated } from "#shared/types/shared";
import type { VideoResource } from "#shared/resources/videos";

const { videos } = defineProps<{ videos: Paginated<VideoResource> }>();
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <VideoCard v-for="video in videos.items" :id="video.id" :video="video" />
  </div>
</template>
