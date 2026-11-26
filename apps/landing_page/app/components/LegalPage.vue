<script lang="ts" setup>
import type { LegalDocument } from "~/utils/legal";

const { document } = defineProps<{ document: LegalDocument }>();

const { t, locale } = useI18n();

const updated = computed(() =>
  new Intl.DateTimeFormat(locale.value, { dateStyle: "long" }).format(
    new Date(LEGAL_INFO.updated_at),
  ),
);

useSeoMeta({
  title: () => document.title,
  description: () => document.description,
});
</script>

<template>
  <article class="mx-auto flex w-full max-w-[760px] flex-col gap-12 pt-[clamp(24px,5vw,72px)]">
    <header class="flex flex-col gap-5">
      <span class="text-ui-text-muted text-[13px] font-semibold tracking-[0.04em]">
        {{ t("legal.updated", { date: updated }) }}
      </span>
      <h1 class="section-title text-ui-text text-[clamp(34px,5vw,64px)]">{{ document.title }}</h1>
      <p class="text-ui-text-muted m-0 text-[17px] leading-[1.6] text-pretty">
        <LegalText :text="document.intro" />
      </p>
    </header>

    <nav :aria-label="t('legal.toc')" class="border-ui-border border-y py-5">
      <ol class="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        <li v-for="(section, index) in document.sections" :key="section.title">
          <a
            :href="`#section-${index + 1}`"
            class="text-ui-text-muted hover:text-ui-text text-[15px] transition-colors"
          >
            <span class="text-alt-text tabular-nums">{{ String(index + 1).padStart(2, "0") }}</span>
            &nbsp;{{ section.title }}
          </a>
        </li>
      </ol>
    </nav>

    <section
      v-for="(section, index) in document.sections"
      :id="`section-${index + 1}`"
      :key="section.title"
      class="flex scroll-mt-24 flex-col gap-4"
    >
      <h2
        class="font-display text-ui-text m-0 text-[clamp(22px,2.4vw,28px)] leading-[1.2] font-medium tracking-[-0.02em] text-balance"
      >
        {{ section.title }}
      </h2>
      <template v-for="(block, blockIndex) in section.blocks" :key="blockIndex">
        <ul
          v-if="Array.isArray(block)"
          class="text-ui-text-muted m-0 flex list-disc flex-col gap-2 pl-5 text-base leading-[1.65] marker:text-[var(--alt-text)]"
        >
          <li v-for="item in block" :key="item" class="text-pretty">
            <LegalText :text="item" />
          </li>
        </ul>
        <p v-else class="text-ui-text-muted m-0 text-base leading-[1.65] text-pretty">
          <LegalText :text="block" />
        </p>
      </template>
    </section>
  </article>
</template>
