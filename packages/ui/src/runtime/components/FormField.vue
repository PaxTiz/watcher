<script lang="ts" setup>
import { computed, inject, provide, type Ref, type VNode } from "vue";

import { FORM_ERRORS_SYMBOL, HAS_FORM_SINGLE_ERROR_SYMBOL } from "../types/forms";

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
    <label v-if="label" :for="name" class="text-ui-text text-sm font-medium">{{ label }}</label>

    <div class="mt-1.5">
      <slot name="default" />
      <p v-if="hasError" class="mt-1.5 text-[13px] text-red-500">{{ error }}</p>
    </div>
  </div>
</template>
