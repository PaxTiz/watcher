<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <footer class="bg-background pt-16">
    <div class="container">
      <div class="bg-alt rounded p-8 sm:p-16">
        <h2 class="section-title__white text-left md:text-center">
          {{ t("footer.title") }}
        </h2>
        <p class="mt-4 text-left font-medium text-white md:text-center">
          {{ t("footer.description") }}
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-start gap-4 md:justify-center">
          <WatcherButton :label="t('footer.ctaTwitch')" color="white" size="lg" class="font-bold" />
          <WatcherButton
            :label="t('footer.ctaYoutube')"
            color="glass"
            size="lg"
            class="font-bold"
          />
        </div>
      </div>
    </div>

    <div class="bg-ui-bg mt-16 py-8">
      <div class="container">
        <div
          class="flex flex-col items-start justify-between gap-4 text-left sm:flex-row sm:items-center"
        >
          <div>
            <WatcherLogo />
          </div>

          <div class="text-landing-text text-sm">
            <span>{{ t("footer.copyright") }}</span>
          </div>

          <div class="text-landing-text inline-flex gap-4 text-sm">
            <span>{{ t("footer.privacy") }}</span>
            <span>{{ t("footer.terms") }}</span>
            <span>{{ t("footer.contact") }}</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
