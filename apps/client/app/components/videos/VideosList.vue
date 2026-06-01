<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import type { Paginated } from "#shared/types/shared";

const VIDEOS_PER_PAGE = 21;

const modelValue = defineModel<number>("page", { required: true });
const {
  videos,
  loading = false,
  allowHideVideo = true,
  allowHideChannel = true,
} = defineProps<{
  videos: Paginated<VideoResource>;
  loading?: boolean;
  allowHideVideo?: boolean;
  allowHideChannel?: boolean;
}>();
</script>

<template>
  <div v-if="loading" class="infinite-grid-[380px] gap-4">
    <Card
      v-for="i in 9"
      :key="i"
      size="flat"
      class="shadow-ui-border border-2 border-transparent shadow"
    >
      <div class="bg-ui-border/50 aspect-video w-full animate-pulse rounded-t" />
      <div class="grid grid-cols-[2rem_1fr_2rem] gap-4 p-4">
        <div class="bg-ui-border/50 size-8 animate-pulse rounded" />
        <div class="space-y-2">
          <div class="bg-ui-border/50 h-5 w-full animate-pulse rounded" />
          <div class="bg-ui-border/50 h-4 w-2/3 animate-pulse rounded" />
        </div>
        <div class="bg-ui-border/50 size-8 animate-pulse rounded" />
      </div>
    </Card>
  </div>

  <template v-else-if="videos.items.length > 0">
    <div class="infinite-grid-[380px] gap-4">
      <VideoCard
        v-for="video in videos.items"
        :key="video.id"
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
