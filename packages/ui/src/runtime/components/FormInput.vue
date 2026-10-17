<script lang="ts" setup>
import { computed, inject, useTemplateRef, type ComputedRef } from "vue";

import { CLEAN_ERROR_SYMBOL, HAS_FORM_SINGLE_ERROR_SYMBOL } from "../types/forms";

const modelValue = defineModel<string>();
const { size = "normal" } = defineProps<{ placeholder?: string; size?: "sm" | "normal" }>();

const __internal_element__ = useTemplateRef("element");

const name = inject<string | undefined>("name", undefined);
const hasError = inject<ComputedRef<boolean>>(
  HAS_FORM_SINGLE_ERROR_SYMBOL,
  computed(() => false),
);
const onCleanError = inject<(key: string) => void>(CLEAN_ERROR_SYMBOL, () => {});

const onInput = useDebounceFn(() => {
  if (name) {
    onCleanError?.(name);
  }
}, 300);

defineExpose({
  focus: () => {
    __internal_element__.value?.focus();
  },
});
</script>

<template>
  <input
    ref="element"
    v-model="modelValue"
    :name="name"
    :id="name"
    :placeholder="placeholder"
    class="control-field"
    :class="{
      '!shadow-[inset_0_0_0_1px_rgb(239_68_68)]': hasError,
      '!h-8 !rounded-lg !px-2.5 text-[13px]': size === 'sm',
    }"
    @input="onInput"
  />
</template>
