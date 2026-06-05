<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import type { Paginated } from "#shared/types/shared";

const modelValue = defineModel<number>("page", { required: true });
const {
  videos,
  loading = false,
  allowHideVideo = true,
  allowHideChannel = true,
  allowToggleFavorite = true,
  httpKey,
} = defineProps<{
  videos: Paginated<VideoResource>;
  perPage: number;
  loading?: boolean;
  allowHideVideo?: boolean;
  allowHideChannel?: boolean;
  allowToggleFavorite?: boolean;
  httpKey?: string;
}>();

const on_hide_video = async () => {
  if (httpKey) {
    await refreshNuxtData(httpKey);
  }
};

const on_hide_subscription = async () => {
  if (httpKey) {
    await refreshNuxtData(httpKey);
  }
};

const on_toggle_favorite = async () => {
  if (httpKey) {
    await refreshNuxtData(httpKey);
  }
};
</script>

<template>
  <VideosGridSkeleton v-if="loading" />

  <template v-else-if="videos.items.length > 0">
    <div class="infinite-grid-[300px] gap-4">
      <VideoCard
        v-for="video in videos.items"
        :key="video.id"
        :video="video"
        :allow-hide-video="allowHideVideo"
        :allow-hide-channel="allowHideChannel"
        :allow-toggle-favorite="allowToggleFavorite"
        @hide-video="on_hide_video"
        @hide-subscription="on_hide_subscription"
        @toggle-favorite="on_toggle_favorite"
      />
    </div>

    <div v-if="videos.total > perPage" class="mt-8 flex justify-center">
      <Pagination v-model:page="modelValue" :total-items="videos.total" :per-page="perPage" />
    </div>
  </template>

  <div v-else class="my-16 flex justify-center">
    <p class="text-ui-text">Désolé, aucun résultat n'a été trouvé pour votre recherche..</p>
  </div>
</template>
