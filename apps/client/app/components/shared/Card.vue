<script lang="ts" setup>
import type { Component, VNode } from "vue";

const {
  tag = "div",
  size = "normal",
  transparent = false,
} = defineProps<{
  tag?: keyof HTMLElementTagNameMap | Component;
  size?: "sm" | "normal" | "flat";
  transparent?: boolean;
}>();
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <component
    class="group focus:outline-alt border-ui-border relative z-1 block rounded border"
    :class="{ 'p-2': size === 'sm', 'p-4': size === 'normal', 'bg-ui-bg': !transparent }"
    :is="tag"
  >
    <slot />
  </component>
</template>
