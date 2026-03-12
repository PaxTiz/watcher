<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";
import { NuxtLink } from "#components";

const {
  to,
  disabled,
  size = "normal",
  color = "primary",
  allowRemove = false,
} = defineProps<{
  tag?: string;
  label?: string;
  to?: RouteLocationRaw;
  icon?: string;
  size?: "sm" | "normal";
  disabled?: boolean;
  color?: "primary" | "secondary";
  allowRemove?: boolean;
}>();

const component = computed(() => (to ? NuxtLink : "button"));

const classes = computed(() => {
  return {
    "min-h-[38px] text-sm py-2 px-3": size === "normal",
    "min-h-[30px] text-sm py-1 px-2": size === "sm",
    "bg-[#11111b] border-2 border-ui-border text-ui-text not-disabled:hover:border-alt not-disabled:hover:text-alt":
      color === "primary",
    "bg-alt/75 text-white": color === "secondary",
    "cursor-pointer": !disabled,
    "cursor-not-allowed opacity-50": disabled,
  };
});
</script>

<template>
  <component
    class="group flex items-center justify-center gap-2 rounded border border-transparent not-disabled:hover:opacity-75 transition-all duration-300"
    :is="component"
    :to="to"
    :class="classes"
    :disabled="disabled"
  >
    <Icon v-if="icon" :name="icon" />

    <span v-if="tag" class="text-[10px] p-1 bg-ui-bg rounded">
      {{ tag }}
    </span>

    <span v-if="label">
      {{ label }}
    </span>

    <span v-if="allowRemove" class="flex items-center">
      <Icon name="lucide:x" />
    </span>
  </component>
</template>
