<script lang="ts" setup>
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t("page.home")),
  description: computed(() => t("hero.lead")),
  ogTitle: computed(() => `${t("hero.title")} ${t("hero.title_accent")}`),
  ogDescription: computed(() => t("hero.lead")),
});
</script>

<template>
  <Hero />
  <WhySection />
  <FeaturesSection />
  <FusionSection />
  <StartSection />
  <RoadmapSection />
  <FaqSection />
  <CtaSection />
</template>
