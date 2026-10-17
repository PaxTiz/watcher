<script lang="ts" setup>
import { useVideosInProgress } from "~/composables/videos/useVideosInProgress";

definePageMeta({ name: pages.home });

useOAuthRedirectionHandler();

// The video to resume lights the page
const { data: in_progress } = await useVideosInProgress();
usePageAmbient(() => in_progress.value?.items[0]);

useMeta({
  title: "Accueil",
  description: "Découvrez les dernières sorties de vos créateurs favoris.",
});
</script>

<template>
  <div class="space-y-10 md:space-y-12">
    <DashboardHeader />

    <DashboardSectionVideosInProgress />

    <DashboardSectionVideosFavorites />

    <DashboardSectionVideosTimeline />
  </div>
</template>
