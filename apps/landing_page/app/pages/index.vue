<script lang="ts" setup>
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t("page.home")),
  description: computed(() => t("hero.subtitle")),
  ogTitle: computed(() => t("page.home")),
  ogDescription: computed(() => t("hero.subtitle")),
});
</script>

<template>
  <Hero />

  <ChannelsOverview />

  <MainFeatures />

  <ChannelsGrouping />

  <PlatformViewer />

  <FrequentQuestions />
</template>
