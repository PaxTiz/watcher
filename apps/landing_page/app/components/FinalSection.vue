<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <section
    id="start"
    aria-labelledby="start-title"
    class="pt-[clamp(100px,16vh,160px)] pb-[clamp(80px,12vh,120px)] text-center"
  >
    <div class="container">
      <TwoToneTitle id="start-title" :title="t('final.title')" :soft="t('final.title_soft')" />

      <div class="mt-7.5 flex flex-wrap justify-center gap-2.5">
        <WatcherButton
          :label="t('final.google')"
          icon="fa7-brands:google"
          color="solid"
          size="lg"
        />
        <WatcherButton
          :label="t('final.twitch')"
          icon="fa7-brands:twitch"
          size="lg"
          :ui="{ root: '!bg-ui-bg !ring-ui-border' }"
        />
      </div>
      <p class="text-ui-text-muted mt-3.5 text-[13px]">{{ t("final.note") }}</p>
    </div>
  </section>
</template>
