<script lang="ts" generic="T extends string" setup>
import { computed, inject, useTemplateRef, type ComputedRef } from "vue";

import { useI18n } from "#imports";

import { CLEAN_ERROR_SYMBOL, HAS_FORM_SINGLE_ERROR_SYMBOL } from "../types/forms";

const modelValue = defineModel<string>();
const props = defineProps<{
  placeholder?: string;
  items: Array<{
    label: string;
    value: T;
    disabled?: boolean;
  }>;
}>();

const { t } = useI18n();

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
        class="control-field group flex w-full cursor-pointer items-center justify-between gap-2"
        :class="{ 'ring ring-red-400': hasError }"
      >
        <SelectValue :placeholder="placeholder ?? t('ui.select.placeholder')" />
        <Icon
          name="lucide:chevron-down"
          class="transition-all duration-300 group-data-[state=open]:rotate-180"
        />
      </SelectTrigger>

      <SelectPortal>
        <Transition appear>
          <SelectContent
            class="menu-surface absolute z-1000 mt-2 flex w-max min-w-[var(--reka-select-trigger-width)] flex-col"
            position="popper"
            :side-offset="5"
          >
            <SelectViewport>
              <SelectItem value="none" class="menu-item relative pl-8 select-none">
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
                class="menu-item relative pl-8 select-none"
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
