<script lang="ts" setup>
import { useVideosInProgress } from "~/composables/videos/useVideosInProgress";

const { data: videos, refresh, status } = await useVideosInProgress();
</script>

<template>
  <VideosRow
    v-if="videos && videos.items.length > 0"
    title="Reprendre la lecture"
    icon="lucide:history"
    :videos="videos.items"
    @change="refresh"
  />
</template>
