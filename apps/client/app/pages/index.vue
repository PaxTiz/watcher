<script lang="ts" setup>
definePageMeta({ name: pages.home });

useOAuthRedirectionHandler();
</script>

<template>
  <div class="space-y-8 md:space-y-12">
    <DashboardHeader />

    <DashboardSectionVideosFavorites />

    <DashboardSectionVideosTimeline />
  </div>
</template>
