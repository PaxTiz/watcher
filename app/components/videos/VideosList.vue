<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import type { Paginated } from "#shared/types/shared";

const modelValue = defineModel<number>("page", { required: true });
const { videos } = defineProps<{ videos: Paginated<VideoResource> }>();
</script>

<template>
  <template v-if="videos.items.length > 0">
    <div class="infinite-grid-[380px] gap-4">
      <VideoCard v-for="video in videos.items" :id="video.id" :video="video" />
    </div>

    <div class="mt-8 flex justify-center">
      <Pagination v-model:page="modelValue" :total-items="videos.total" :per-page="21" />
    </div>
  </template>

  <div v-else class="my-16 flex justify-center">
    <p class="text-ui-text">Désolé, aucun résultat n'a été trouvé pour votre recherche..</p>
  </div>
</template>
