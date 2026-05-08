<script lang="ts" generic="S extends ZodMiniType, I extends input<S>, O extends output<S>" setup>
import type { VNode } from "vue";
import { type ZodMiniType, type input, type output } from "zod/mini";

defineSlots<{ default: () => VNode }>();
const props = defineProps<{ method?: "POST" | "GET"; schema: S; state: I }>();
const emit = defineEmits<{ submit: [O] }>();

const onSubmit = () => {
  const response = props.schema.safeParse(props.state);
  if (response.success) {
    emit("submit", response.data as O);
  }
};
</script>

<template>
  <form :method="method" @submit.prevent="onSubmit">
    <slot />
  </form>
</template>
