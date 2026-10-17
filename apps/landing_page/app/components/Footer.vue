<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <footer class="border-ui-border border-t">
    <div
      class="text-ui-text-muted container flex flex-wrap items-center justify-between gap-4 py-7 text-[13px]"
    >
      <WatcherLogo
        class="[&_span]:font-display [&_div]:size-[26px] [&_div]:text-[15px] [&_span]:text-[15px] [&_span]:font-medium"
      />
      <span>{{ t("footer.copyright") }}</span>
      <nav class="flex gap-5" aria-label="Footer">
        <span>{{ t("footer.privacy") }}</span>
        <span>{{ t("footer.terms") }}</span>
        <span>{{ t("footer.contact") }}</span>
      </nav>
    </div>
  </footer>
</template>
