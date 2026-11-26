<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <footer
    class="border-ui-border text-ui-text-muted flex flex-wrap items-center justify-between gap-3.5 border-t pt-4.5 text-sm"
  >
    <span>{{ t("footer.copyright") }}</span>
    <nav class="flex gap-5" :aria-label="t('footer.label')">
      <NuxtLinkLocale to="privacy" class="text-ui-text-muted hover:text-ui-text transition-colors">
        {{ t("footer.privacy") }}
      </NuxtLinkLocale>
      <NuxtLinkLocale to="terms" class="text-ui-text-muted hover:text-ui-text transition-colors">
        {{ t("footer.terms") }}
      </NuxtLinkLocale>
      <a
        :href="`mailto:${LEGAL_INFO.email}`"
        class="text-ui-text-muted hover:text-ui-text transition-colors"
      >
        {{ t("footer.contact") }}
      </a>
    </nav>
  </footer>
</template>
