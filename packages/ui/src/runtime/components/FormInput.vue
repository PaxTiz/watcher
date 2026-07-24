<script lang="ts" setup>
import { useDebounceFn } from "@vueuse/core";
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
    :class="{ 'ring ring-red-400': hasError, [`size__${size}`]: true }"
    @input="onInput"
  />
</template>
