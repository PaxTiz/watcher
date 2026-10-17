<script lang="ts" setup>
import { computed } from "vue";
import type { VNode } from "vue";

import type { AccordionItem } from "../types/accordion";

type AccordionSlotProps = { item: AccordionItem; index: number; open: boolean };

const {
  type = "single",
  collapsible = true,
  size = "md",
} = defineProps<{
  items: Array<AccordionItem>;
  type?: "single" | "multiple";
  collapsible?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  ui?: {
    root?: string;
    item?: string;
    trigger?: string;
    content?: string;
  };
}>();

const triggerClasses = computed(() => {
  if (size === "lg") {
    return "px-6 py-5 text-lg gap-3";
  }
  if (size === "md") {
    return "px-5 py-4 text-[15px] gap-2";
  }
  return "p-3 text-sm gap-2";
});

const contentClasses = computed(() => {
  if (size === "lg") {
    return "px-6 pb-5 text-base";
  }
  if (size === "md") {
    return "px-5 pb-4 text-[15px]";
  }
  return "px-3 pb-3 text-sm";
});
defineSlots<
  {
    content?: (props: AccordionSlotProps) => VNode;
  } & {
    [key: string]: ((props: AccordionSlotProps) => VNode) | undefined;
  }
>();

const modelValue = defineModel<string | string[]>();
</script>

<template>
  <AccordionRoot
    v-model="modelValue"
    :type="type"
    :collapsible="collapsible"
    :disabled="disabled"
    class="bg-ui-bg divide-ui-border flex flex-col divide-y overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--ui-border)]"
    :class="ui?.root"
  >
    <AccordionItem
      v-for="(item, index) in items"
      :key="item.value"
      v-slot="{ open }"
      :value="item.value"
      :disabled="item.disabled"
      class="overflow-hidden"
      :class="ui?.item"
    >
      <AccordionHeader as="h3" class="flex">
        <AccordionTrigger
          class="group focus-visible:outline-alt text-ui-text hover:bg-ui-text/[0.03] flex w-full flex-1 cursor-pointer items-center justify-between text-start font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          :class="[triggerClasses, ui?.trigger]"
        >
          <span class="flex items-center gap-2">
            <Icon v-if="item.icon" :name="item.icon" />
            <span>{{ item.label }}</span>
          </span>

          <Icon
            name="lucide:chevron-down"
            class="text-ui-text-muted shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180"
          />
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent
        class="accordion-content text-ui-text-muted overflow-hidden leading-relaxed"
      >
        <div :class="[contentClasses, ui?.content]">
          <slot :name="item.slot ?? 'content'" :item="item" :index="index" :open="open">
            {{ item.content }}
          </slot>
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>

<style scoped>
.accordion-content {
  &[data-state="open"] {
    animation: accordion-down 0.2s ease-out;
  }
  &[data-state="closed"] {
    animation: accordion-up 0.2s ease-out;
  }
}

@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--reka-accordion-content-height);
  }
}

@keyframes accordion-up {
  from {
    height: var(--reka-accordion-content-height);
  }
  to {
    height: 0;
  }
}
</style>
