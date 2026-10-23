<script lang="ts" setup>
definePageMeta({ layout: "auth" });

const { t } = useI18n();

useMeta({
  title: () => t("onboarding.title"),
  description: () => t("onboarding.description"),
});
</script>

<template>
  <section>
    <WatcherLogo class="h-7" />

    <h1 class="page-title mt-10 md:text-3xl">{{ t("onboarding.heading") }}</h1>
    <p class="text-ui-text-muted mt-3">{{ t("onboarding.lead") }}</p>

    <div class="mt-8 space-y-8">
      <OnboardingServicesLogin />
      <OnboardingSynchronization />
    </div>
  </section>
</template>
