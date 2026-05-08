<script lang="ts" setup>
import type { VNode } from "vue";

defineSlots<{ default: (props: { name?: string }) => VNode }>();
const { name } = defineProps<{ label?: string; name?: string }>();

provide("name", name);
</script>

<template>
  <div>
    <label v-if="label" :for="name" class="text-gray-300">{{ label }}</label>

    <div class="mt-1">
      <slot name="default" />
    </div>
  </div>
</template>
