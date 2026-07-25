<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <section id="features" class="bg-background">
    <div class="container py-16">
      <h2 class="section-title mb-1">{{ t("mainFeatures.title") }}</h2>
      <p class="section-description">
        {{ t("mainFeatures.description") }}
      </p>

      <div class="mt-8">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
          <div class="border-ui-border bg-ui-bg rounded border p-6 sm:p-8">
            <div class="bg-alt flex h-12 w-12 items-center justify-center rounded">
              <Icon name="lucide:clapperboard" class="text-2xl text-white" />
            </div>

            <h3 class="sub-section-title mt-4 mb-1">{{ t("mainFeatures.unifiedFeed.title") }}</h3>
            <p class="text-landing-text">
              {{ t("mainFeatures.unifiedFeed.description") }}
            </p>
          </div>

          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="border-ui-border bg-ui-bg rounded border p-6 sm:p-8">
                <div
                  class="dark:bg-ui-border flex h-12 w-12 items-center justify-center rounded bg-black"
                >
                  <Icon name="lucide:leaf" class="text-2xl text-white" />
                </div>

                <h3 class="sub-section-title mt-4 mb-1">
                  {{ t("mainFeatures.simpleInterface.title") }}
                </h3>
                <p class="text-landing-text">
                  {{ t("mainFeatures.simpleInterface.description") }}
                </p>
              </div>

              <div class="border-ui-border bg-ui-bg rounded border p-6 sm:p-8">
                <div
                  class="dark:bg-ui-border flex h-12 w-12 items-center justify-center rounded bg-black"
                >
                  <Icon name="lucide:play" class="bg-white text-2xl text-white" />
                </div>

                <h3 class="sub-section-title mt-4 mb-1">
                  {{ t("mainFeatures.integratedPlayer.title") }}
                </h3>
                <p class="text-landing-text">
                  {{ t("mainFeatures.integratedPlayer.description") }}
                </p>
              </div>
            </div>

            <div
              class="border-ui-border bg-alt flex flex-col items-start gap-4 rounded border p-6 text-left sm:flex-row sm:items-center sm:p-8"
            >
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white/30">
                <Icon name="lucide:move-right" class="bg-white text-2xl text-white" />
              </div>

              <div>
                <h3 class="sub-section-title__white">
                  {{ t("mainFeatures.channelGrouping.title") }}
                </h3>
                <p class="mt-2 text-white">
                  {{ t("mainFeatures.channelGrouping.description") }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
