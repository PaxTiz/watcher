<script lang="ts" setup>
import type { VNode } from "vue";

import { FORM_ERRORS_SYMBOL, HAS_FORM_SINGLE_ERROR_SYMBOL } from "#shared/types/forms";

defineSlots<{ default: (props: { name?: string }) => VNode }>();
const { name } = defineProps<{ label?: string; name?: string }>();

provide("name", name);

const errors = inject<Ref<Record<string, string>>>(FORM_ERRORS_SYMBOL);
const error = computed(() => (name ? errors?.value[name] : undefined));
const hasError = computed(() => !!error.value);

provide(HAS_FORM_SINGLE_ERROR_SYMBOL, hasError);
</script>

<template>
  <div>
    <label v-if="label" :for="name" class="text-ui-text-muted">{{ label }}</label>

    <div class="mt-1">
      <slot name="default" />
      <p v-if="hasError" class="mt-1 text-sm text-red-400">{{ error }}</p>
    </div>
  </div>
</template>
