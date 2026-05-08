<script lang="ts" setup>
import type { Component, VNode } from "vue";

const { tag = "div", size = "normal" } = defineProps<{
  tag?: keyof HTMLElementTagNameMap | Component;
  size?: "sm" | "normal";
}>();
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <component
    class="group bg-ui-bg focus:outline-alt block rounded border"
    :class="{ 'p-2': size === 'sm', 'p-4': size === 'normal' }"
    :is="tag"
  >
    <slot />
  </component>
</template>
