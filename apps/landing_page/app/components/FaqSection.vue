<script lang="ts" setup>
const { t } = useI18n();

const questions = ["free", "platforms", "access", "mobile"] as const;
</script>

<template>
  <section id="questions" aria-labelledby="questions-title" class="pt-[clamp(90px,15vh,150px)]">
    <div class="container grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
      <TwoToneTitle id="questions-title" :title="t('faq.title')" :soft="t('faq.titleSoft')" />

      <dl class="border-ui-border m-0 border-t">
        <template v-for="question in questions" :key="question">
          <dt class="text-ui-text pt-5.5 text-[1.02rem] font-medium">
            {{ t(`faq.items.${question}.question`) }}
          </dt>
          <dd
            class="border-ui-border m-0 mt-2 border-b pb-5.5 leading-relaxed text-[var(--body-text)]"
          >
            {{ t(`faq.items.${question}.answer`) }}
          </dd>
        </template>
      </dl>
    </div>
  </section>
</template>
