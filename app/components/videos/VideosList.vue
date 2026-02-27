<script lang="ts" setup>
import type { Paginated } from "#shared/types/shared";
import type { VideoResource } from "#shared/resources/videos";

const modelValue = defineModel<number>("page", { required: true });
const { videos } = defineProps<{ videos: Paginated<VideoResource> }>();
</script>

<template>
  <div class="infinite-grid-[380px] gap-4">
    <VideoCard v-for="video in videos.items" :id="video.id" :video="video" />
  </div>

  <div class="flex justify-center mt-8">
    <Pagination v-model:page="modelValue" :total-items="videos.total" :per-page="21" />
  </div>
</template>
