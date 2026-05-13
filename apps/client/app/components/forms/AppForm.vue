<script lang="ts" generic="S extends ZodMiniType, I extends input<S>" setup>
import type { VNode } from "vue";
import { type ZodMiniType, type input } from "zod/mini";

import {
  type FormSubmitEvent,
  FORM_ERRORS_SYMBOL,
  CLEAN_ERROR_SYMBOL,
  HAS_FORM_ERRORS_SYMBOL,
} from "#shared/types/forms";

defineSlots<{ default: () => VNode }>();
const props = defineProps<{ method?: "POST" | "GET"; schema: S; state: I }>();
const emit = defineEmits<{ submit: [FormSubmitEvent<S>] }>();

const errors = ref<Record<string, string>>({});
const hasErrors = computed(() => Object.keys(errors.value).length > 0);

const onSubmit = () => {
  const response = props.schema.safeParse(props.state);
  if (response.success) {
    emit("submit", {
      data: response.data,
    });
  } else {
    errors.value = response.error.issues
      .map((issue) => ({
        key: issue.path.join("."),
        message: issue.message,
      }))
      .reduce(
        (acc, current) => {
          acc[current.key] = current.message;
          return acc;
        },
        {} as Record<string, string>,
      );
  }
};

const onCleanError = (key: string) => {
  if (errors.value[key]) {
    delete errors.value[key];
  }
};

provide(FORM_ERRORS_SYMBOL, errors);
provide(CLEAN_ERROR_SYMBOL, onCleanError);
provide(HAS_FORM_ERRORS_SYMBOL, hasErrors);
</script>

<template>
  <form :method="method" @submit.prevent="onSubmit">
    <slot />
  </form>
</template>
