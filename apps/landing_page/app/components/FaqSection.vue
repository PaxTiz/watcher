<script lang="ts" setup>
const { t } = useI18n();

const QUESTIONS = ["free", "algorithm", "security"] as const;

const open = ref<string>("free");
</script>

<template>
  <section
    id="faq"
    aria-labelledby="faq-title"
    class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-x-[clamp(32px,6vw,96px)] gap-y-10"
  >
    <div class="sticky top-[104px]">
      <SectionHeading id="faq-title" number="06" size="md" label="FAQ" :title="t('faq.title')" />
    </div>

    <AccordionRoot
      v-model="open"
      type="single"
      collapsible
      class="border-ui-border flex flex-col border-b"
    >
      <AccordionItem
        v-for="question in QUESTIONS"
        :key="question"
        v-slot="{ open: expanded }"
        :value="question"
        class="border-ui-border border-t"
      >
        <AccordionHeader as="h3" class="m-0 flex">
          <AccordionTrigger
            class="text-ui-text flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent py-5.5 text-left text-[17px] font-semibold"
          >
            {{ t(`faq.items.${question}.question`) }}
            <span
              aria-hidden="true"
              class="border-ui-border text-ui-text-muted flex size-8 shrink-0 items-center justify-center rounded-full border text-lg leading-none font-normal"
            >
              {{ expanded ? "−" : "+" }}
            </span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <p class="text-ui-text-muted m-0 pr-10 pb-6 text-base leading-[1.6] text-pretty">
            {{ t(`faq.items.${question}.answer`) }}
          </p>
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>
  </section>
</template>
