<script lang="ts" setup>
import { CLEAN_ERROR_SYMBOL, HAS_FORM_SINGLE_ERROR_SYMBOL } from "#shared/types/forms";

const modelValue = defineModel<string>({ required: true });

const __internal_element__ = useTemplateRef("element");

const name = inject<string | undefined>("name");
const hasError = inject<ComputedRef<boolean>>(HAS_FORM_SINGLE_ERROR_SYMBOL);
const onCleanError = inject<(key: string) => void>(CLEAN_ERROR_SYMBOL);

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
    :class="{ 'ring ring-red-400': hasError }"
    @input="onInput"
  />
</template>
