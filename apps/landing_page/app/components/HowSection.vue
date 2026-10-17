<script lang="ts" setup>
const { t } = useI18n();

const steps = ["connect", "import", "watch"] as const;
</script>

<template>
  <SectionIntro id="how" :title="t('how.title')" :soft="t('how.titleSoft')">
    <ol class="border-ui-border mt-10 grid border-t md:grid-cols-3">
      <li
        v-for="(step, index) in steps"
        :key="step"
        class="border-ui-border border-b py-6 md:border-b-0 md:py-0 md:pt-6.5 md:pr-6.5 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-6.5"
      >
        <span class="text-alt font-mono text-[13px]">{{ String(index + 1).padStart(2, "0") }}</span>
        <h3 class="text-ui-text mt-3 mb-2 text-lg font-medium tracking-[-0.01em]">
          {{ t(`how.${step}.title`) }}
        </h3>
        <p class="m-0 leading-relaxed text-[var(--body-text)]">{{ t(`how.${step}.text`) }}</p>
      </li>
    </ol>
  </SectionIntro>
</template>
