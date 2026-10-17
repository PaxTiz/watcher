<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <section class="pt-[clamp(56px,10vh,110px)]">
    <div class="container">
      <div class="flex flex-wrap items-end justify-between gap-7">
        <div>
          <TwoToneTitle as="h1" size="hero" :title="t('hero.title')" :soft="t('hero.titleSoft')" />
          <p class="lead mt-5.5">{{ t("hero.lead") }}</p>
        </div>

        <div>
          <div class="flex flex-wrap gap-2.5">
            <WatcherButton :label="t('hero.ctaStart')" to="#start" color="solid" size="lg" />
            <WatcherButton
              :label="t('hero.ctaHow')"
              to="#feed"
              size="lg"
              :ui="{ root: '!bg-ui-bg !ring-ui-border' }"
            />
          </div>
          <p class="text-ui-text-muted mt-3.5 text-[13px]">{{ t("hero.note") }}</p>
        </div>
      </div>

      <AppShowcase class="mt-[clamp(40px,7vh,64px)]" />
    </div>
  </section>
</template>
