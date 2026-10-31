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
            class="menu-surface z-1000 flex w-max min-w-[max(var(--reka-select-trigger-width),11rem)] flex-col"
            position="popper"
            :side-offset="5"
          >
            <SelectViewport>
              <SelectItem value="none" class="menu-item data-[state=checked]:font-medium">
                <SelectItemText class="flex-1">{{ placeholder ?? "-" }}</SelectItemText>
                <SelectItemIndicator class="ml-auto flex shrink-0">
                  <Icon name="lucide:check" class="!text-alt" />
                </SelectItemIndicator>
              </SelectItem>

              <SelectItem
                v-for="item in items"
                :key="item.value"
                :value="item.value"
                :disabled="item.disabled"
                class="menu-item data-[state=checked]:font-medium"
              >
                <SelectItemText class="flex-1">{{ item.label }}</SelectItemText>
                <SelectItemIndicator class="ml-auto flex shrink-0">
                  <Icon name="lucide:check" class="!text-alt" />
                </SelectItemIndicator>
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
