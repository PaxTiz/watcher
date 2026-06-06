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
  ui,
} = defineProps<{
  tag?: string;
  label?: string;
  to?: RouteLocationRaw;
  icon?: string;
  iconSize?: "normal" | "lg";
  size?: "sm" | "normal" | "lg";
  disabled?: boolean;
  color?: "primary" | "secondary" | "yellow" | "ghost";
  allowRemove?: boolean;
  type?: "submit" | "button";
  external?: boolean;
  loading?: boolean;
  ui?: { root?: string };
}>();

const component = computed(() => (to ? NuxtLink : "button"));

const classes = computed(() => {
  const inner_classes = [];

  if (size === "lg") {
    inner_classes.push("min-h-[46px]", "text-sm", "py-3", "px-4");
  }
  if (size === "normal") {
    inner_classes.push("min-h-[38px]", "text-sm", "py-2", "px-3");
  }
  if (size === "sm") {
    inner_classes.push("min-h-[30px]", "text-sm", "py-1", "px-2");
  }
  if (color === "primary") {
    inner_classes.push(
      "bg-ui-bg",
      "border-2",
      "border-ui-border",
      "text-ui-text",
      "not-disabled:hover:border-alt",
      "not-disabled:hover:text-alt",
      "not-disabled:hover:opacity-75",
    );
  }
  if (color === "yellow") {
    inner_classes.push(
      "bg-ui-bg",
      "hover:bg-yellow-500/10",
      "border-2",
      "border-yellow-400",
      "text-yellow-400",
      "not-disabled:hover:border-yellow-500",
      "not-disabled:hover:text-yellow-500",
    );
  }
  if (color === "secondary") {
    inner_classes.push("bg-alt", "hover:bg-alt/75", "text-white");
  }
  if (color === "ghost") {
    inner_classes.push("bg-transparent", "border-none", "text-ui-text-muted", "hover:text-ui-text");
  }
  if (!disabled && !loading) {
    inner_classes.push("cursor-pointer");
  }
  if (disabled || loading) {
    inner_classes.push("cursor-not-allowed", "opacity-50");
  }

  return inner_classes;
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
    :class="[...classes, ui?.root]"
    :disabled="hasFormErrors || disabled || loading"
    :type="type"
    :external="external"
  >
    <Icon v-if="loading" name="lucide:loader-2" class="animate-spin" />
    <Icon v-else-if="icon" :name="icon" :class="{ 'text-lg': iconSize === 'lg' }" />

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
