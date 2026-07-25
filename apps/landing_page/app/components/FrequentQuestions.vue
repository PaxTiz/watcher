<script lang="ts" setup>
const { t } = useI18n();

const items = computed(() => [
  {
    label: t("faq.items.isAppFree.label"),
    value: "is_app_free",
    content: t("faq.items.isAppFree.content"),
  },
  {
    label: t("faq.items.howSyncWorks.label"),
    value: "how_sync_works",
    content: t("faq.items.howSyncWorks.content"),
  },
  {
    label: t("faq.items.areCredentialsSafe.label"),
    value: "are_credentials_safe",
    content: t("faq.items.areCredentialsSafe.content"),
  },
  {
    label: t("faq.items.platformAccess.label"),
    value: "plateform_access",
    content: t("faq.items.platformAccess.content"),
  },
]);
</script>

<template>
  <section id="questions" class="bg-background py-16">
    <div class="container">
      <h2 class="section-title text-left md:text-center">{{ t("faq.title") }}</h2>

      <WatcherAccordion :items="items" class="mt-8" />
    </div>
  </section>
</template>
