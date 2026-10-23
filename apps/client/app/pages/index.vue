<script lang="ts" setup>
import { useVideosInProgress } from "~/composables/videos/useVideosInProgress";

definePageMeta({ name: pages.home });

const { t } = useI18n();

useOAuthRedirectionHandler();

const { data: in_progress } = await useVideosInProgress();
usePageAmbient(() => in_progress.value?.items[0]);

usePageNavigation()([]);

useMeta({
  title: () => t("nav.home"),
  description: () => t("dashboard.description"),
});
</script>

<template>
  <div class="space-y-10 md:space-y-12">
    <DashboardSectionVideosInProgress />

    <DashboardSectionVideosFavorites />

    <DashboardSectionVideosTimeline />
  </div>
</template>
