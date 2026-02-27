<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";
import { NuxtLink } from "#components";

const {
  to,
  disabled,
  size = "normal",
  color = "primary",
} = defineProps<{
  label?: string;
  to?: RouteLocationRaw;
  icon?: string;
  size?: "sm" | "normal";
  disabled?: boolean;
  color?: "primary" | "secondary";
}>();

const component = computed(() => (to ? NuxtLink : "button"));

const classes = computed(() => {
  return {
    "min-h-[38px] text-sm py-2 px-4": size === "normal",
    "min-h-[30px] text-sm py-1 px-2": size === "sm",
    "bg-ui-border text-ui-text not-disabled:hover:border-alt not-disabled:hover:text-alt":
      color === "primary",
    "bg-alt/75 text-white": color === "secondary",
    "cursor-pointer": !disabled,
    "cursor-not-allowed opacity-50": disabled,
  };
});
</script>

<template>
  <component
    :is="component"
    :to="to"
    :class="classes"
    :disabled="disabled"
    class="flex items-center justify-center rounded border border-transparent not-disabled:hover:opacity-75 transition-all duration-300"
  >
    <Icon v-if="icon" :name="icon" />

    <span v-if="label">
      {{ label }}
    </span>
  </component>
</template>
