<script lang="ts" setup>
import type { VNode } from "vue";

import type { AccordionItem } from "../types/accordion";

type AccordionSlotProps = { item: AccordionItem; index: number; open: boolean };

const { type = "single", collapsible = true } = defineProps<{
  items: Array<AccordionItem>;
  type?: "single" | "multiple";
  collapsible?: boolean;
  disabled?: boolean;
  ui?: {
    root?: string;
    item?: string;
    trigger?: string;
    content?: string;
  };
}>();
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
    class="flex flex-col gap-2"
    :class="ui?.root"
  >
    <AccordionItem
      v-for="(item, index) in items"
      :key="item.value"
      v-slot="{ open }"
      :value="item.value"
      :disabled="item.disabled"
      class="border-ui-border bg-ui-bg overflow-hidden rounded border"
      :class="ui?.item"
    >
      <AccordionHeader as="h3" class="flex">
        <AccordionTrigger
          class="group focus:outline-alt text-ui-text flex w-full flex-1 cursor-pointer items-center justify-between gap-2 p-3 text-start text-sm disabled:cursor-not-allowed disabled:opacity-50"
          :class="ui?.trigger"
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

      <AccordionContent class="accordion-content text-ui-text-muted overflow-hidden text-sm">
        <div class="px-3 pb-3" :class="ui?.content">
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
