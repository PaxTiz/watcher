<script lang="ts" setup>
const { t } = useI18n();

useHead({ title: computed(() => t("page.home")) });
</script>

<template>
  <Hero />

  <ChannelsOverview />

  <MainFeatures />

  <ChannelsGrouping />

  <PlatformViewer />

  <FrequentQuestions />
</template>
