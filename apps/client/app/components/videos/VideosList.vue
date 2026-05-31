<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import type { Paginated } from "#shared/types/shared";

const VIDEOS_PER_PAGE = 21;

const modelValue = defineModel<number>("page", { required: true });
const {
  videos,
  allowHideVideo = true,
  allowHideChannel = true,
} = defineProps<{
  videos: Paginated<VideoResource>;
  allowHideVideo?: boolean;
  allowHideChannel?: boolean;
}>();
</script>

<template>
  <template v-if="videos.items.length > 0">
    <div class="infinite-grid-[380px] gap-4">
      <VideoCard
        v-for="video in videos.items"
        :id="video.id"
        :video="video"
        :allow-hide-video="allowHideVideo"
        :allow-hide-channel="allowHideChannel"
      />
    </div>

    <div v-if="videos.total > VIDEOS_PER_PAGE" class="mt-8 flex justify-center">
      <Pagination
        v-model:page="modelValue"
        :total-items="videos.total"
        :per-page="VIDEOS_PER_PAGE"
      />
    </div>
  </template>

  <div v-else class="my-16 flex justify-center">
    <p class="text-ui-text">Désolé, aucun résultat n'a été trouvé pour votre recherche..</p>
  </div>
</template>
