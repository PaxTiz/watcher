<script lang="ts" setup>
definePageMeta({ name: pages.home });

useOAuthRedirectionHandler();

useMeta({
  title: "Accueil",
  description: "Découvrez les dernières sorties de vos créateurs favoris.",
});
</script>

<template>
  <div class="space-y-8 md:space-y-12">
    <DashboardHeader />

    <DashboardSectionVideosFavorites />

    <DashboardSectionVideosTimeline />
  </div>
</template>
