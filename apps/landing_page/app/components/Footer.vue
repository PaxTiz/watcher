<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <footer
    class="border-ui-border text-ui-text-muted flex flex-wrap items-center justify-between gap-3.5 border-t pt-4.5 text-sm"
  >
    <span>{{ t("footer.copyright") }}</span>
    <nav class="flex gap-5" :aria-label="t('footer.label')">
      <span>{{ t("footer.privacy") }}</span>
      <span>{{ t("footer.terms") }}</span>
      <span>{{ t("footer.contact") }}</span>
    </nav>
  </footer>
</template>
