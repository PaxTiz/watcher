<script lang="ts" setup>
const { t } = useI18n();

const STEPS = ["twitch", "youtube", "favorites"] as const;
</script>

<template>
  <section
    id="start"
    aria-labelledby="start-title"
    class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-x-[clamp(32px,6vw,96px)] gap-y-10"
  >
    <div class="sticky top-[104px]">
      <SectionHeading
        id="start-title"
        number="04"
        size="md"
        :label="t('start.label')"
        :title="t('start.title')"
      />
    </div>
    <ol class="border-ui-border m-0 flex list-none flex-col border-b p-0">
      <li
        v-for="(step, index) in STEPS"
        :key="step"
        class="border-ui-border grid grid-cols-[52px_minmax(0,1fr)] gap-2 border-t py-6"
      >
        <span
          class="border-ui-border bg-ui-bg text-alt-text flex size-8 items-center justify-center rounded-full border text-[13px] font-semibold tabular-nums"
        >
          {{ String(index + 1).padStart(2, "0") }}
        </span>
        <div class="flex flex-col gap-1.5">
          <h3 class="text-ui-text m-0 text-xl font-semibold">
            {{ t(`start.steps.${step}.title`) }}
          </h3>
          <p class="text-ui-text-muted m-0 text-base leading-[1.55] text-pretty">
            {{ t(`start.steps.${step}.text`) }}
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>
