<script lang="ts" setup>
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t("page.home")),
  description: computed(() => t("hero.lead")),
  ogTitle: computed(() => `${t("hero.title")}. ${t("hero.titleSoft")}.`),
  ogDescription: computed(() => t("hero.lead")),
});
</script>

<template>
  <Hero />
  <FeedSection />
  <PlayerSection />
  <FavoritesSection />
  <HowSection />
  <FaqSection />
  <FinalSection />
</template>
