<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

import { NuxtLink } from "#components";
import { HAS_FORM_ERRORS_SYMBOL } from "#shared/types/forms";

const {
  to,
  disabled,
  size = "normal",
  color = "primary",
  allowRemove = false,
  loading = false,
} = defineProps<{
  tag?: string;
  label?: string;
  to?: RouteLocationRaw;
  icon?: string;
  size?: "sm" | "normal" | "lg";
  disabled?: boolean;
  color?: "primary" | "secondary" | "yellow" | "ghost";
  allowRemove?: boolean;
  type?: "submit" | "button";
  external?: boolean;
  loading?: boolean;
}>();

const component = computed(() => (to ? NuxtLink : "button"));

const classes = computed(() => {
  return {
    "min-h-[46px] text-sm py-3 px-4": size === "lg",
    "min-h-[38px] text-sm py-2 px-3": size === "normal",
    "min-h-[30px] text-sm py-1 px-2": size === "sm",
    "bg-ui-bg border-2 border-ui-border text-ui-text not-disabled:hover:border-alt not-disabled:hover:text-alt not-disabled:hover:opacity-75":
      color === "primary",
    "bg-ui-bg hover:bg-yellow-500/10 border-2 border-yellow-400 text-yellow-400 not-disabled:hover:border-yellow-500 not-disabled:hover:text-yellow-500":
      color === "yellow",
    "bg-alt/75 text-white": color === "secondary",
    "bg-transparent border-none text-ui-text-muted hover:text-ui-text": color === "ghost",
    "cursor-pointer": !disabled && !loading,
    "cursor-not-allowed opacity-50": disabled || loading,
  };
});

const hasFormErrors = inject<ComputedRef<boolean>>(
  HAS_FORM_ERRORS_SYMBOL,
  computed(() => false),
);
</script>

<template>
  <component
    class="group flex items-center justify-center gap-2 rounded border border-transparent transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-75"
    :is="component"
    :to="to"
    :class="classes"
    :disabled="hasFormErrors || disabled || loading"
    :type="type"
    :external="external"
  >
    <Icon v-if="loading" name="lucide:loader-2" class="animate-spin" />
    <Icon v-else-if="icon" :name="icon" />

    <span v-if="tag" class="bg-ui-bg rounded p-1 text-[10px]">
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
