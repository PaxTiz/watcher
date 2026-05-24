<script lang="ts" generic="T extends string" setup>
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "reka-ui";

import { CLEAN_ERROR_SYMBOL, HAS_FORM_SINGLE_ERROR_SYMBOL } from "#shared/types/forms";

const modelValue = defineModel<string>();
const props = defineProps<{
  placeholder?: string;
  items: Array<{
    label: string;
    value: T;
    disabled?: boolean;
  }>;
}>();

const __internal_element__ = useTemplateRef<any>("element");

const name = inject<string | undefined>("name", undefined);
const hasError = inject<ComputedRef<boolean>>(
  HAS_FORM_SINGLE_ERROR_SYMBOL,
  computed(() => false),
);
const onCleanError = inject<(key: string) => void>(CLEAN_ERROR_SYMBOL, () => {});

const onUpdateValue = (val: string) => {
  if (name) {
    onCleanError?.(name);
  }
  modelValue.value = val === "none" ? undefined : (val as T);
};

defineExpose({
  focus: () => {
    __internal_element__.value?.$el?.focus();
  },
});
</script>

<template>
  <div class="relative">
    <SelectRoot :model-value="modelValue ?? 'none'" @update:model-value="onUpdateValue">
      <SelectTrigger
        ref="element"
        class="bg-ui-bg border-ui-border text-ui-text group focus:outline-alt flex min-h-[38px] w-full cursor-pointer items-center justify-between gap-2 rounded border px-2 py-1"
        :class="{ 'ring ring-red-400': hasError }"
      >
        <SelectValue :placeholder="placeholder ?? 'Sélectionner...'" />
        <Icon
          name="lucide:chevron-down"
          class="transition-all duration-300 group-data-[state=open]:rotate-180"
        />
      </SelectTrigger>

      <SelectPortal>
        <Transition appear>
          <SelectContent
            class="bg-ui-bg border-ui-border shadow-ui-border absolute z-1000 mt-2 flex w-max min-w-[var(--reka-select-trigger-width)] flex-col gap-1 rounded border p-1 shadow dark:shadow-black"
            position="popper"
            :side-offset="5"
          >
            <SelectViewport>
              <SelectItem
                value="none"
                class="text-ui-text hover:bg-ui-border/75 data-[highlighted]:bg-ui-border/75 relative flex cursor-pointer items-center rounded p-1.5 pl-8 text-sm outline-none select-none"
              >
                <span class="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
                  <SelectItemIndicator>
                    <Icon name="lucide:check" class="size-4" />
                  </SelectItemIndicator>
                </span>
                <SelectItemText>{{ placeholder ?? "-" }}</SelectItemText>
              </SelectItem>

              <SelectItem
                v-for="item in items"
                :key="item.value"
                :value="item.value"
                :disabled="item.disabled"
                class="text-ui-text hover:bg-ui-border/75 data-[highlighted]:bg-ui-border/75 relative flex cursor-pointer items-center rounded p-1.5 pl-8 text-sm outline-none select-none"
              >
                <span class="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
                  <SelectItemIndicator>
                    <Icon name="lucide:check" class="size-4" />
                  </SelectItemIndicator>
                </span>
                <SelectItemText>{{ item.label }}</SelectItemText>
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </Transition>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
