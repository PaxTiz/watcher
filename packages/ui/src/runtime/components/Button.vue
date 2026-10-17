<script lang="ts" setup>
import { computed, inject, type ComputedRef } from "vue";
import type { RouteLocationRaw } from "vue-router";

import { HAS_FORM_ERRORS_SYMBOL } from "../types/forms";

export type ButtonColor =
  | "neutral"
  | "solid"
  | "brand"
  | "ghost"
  | "danger"
  | "white"
  | "glass"
  // Former names, kept for existing usages
  | "primary"
  | "secondary"
  | "yellow";

const {
  to,
  type,
  disabled,
  label,
  size = "normal",
  color = "neutral",
  allowRemove = false,
  loading = false,
  newTab = false,
  ui,
} = defineProps<{
  tag?: string;
  label?: string;
  to?: RouteLocationRaw;
  icon?: string;
  iconSize?: "normal" | "lg";
  size?: "sm" | "normal" | "lg";
  disabled?: boolean;
  color?: ButtonColor;
  allowRemove?: boolean;
  type?: "submit" | "button";
  external?: boolean;
  newTab?: boolean;
  loading?: boolean;
  ui?: { root?: string };
}>();

const component = computed(() => (to ? "NuxtLink" : "button"));
const resolvedType = computed(() => (to ? undefined : (type ?? "button")));

const COLORS: Record<ButtonColor, string> = {
  neutral:
    "bg-ui-text/[0.06] text-ui-text ring-1 ring-inset ring-ui-text/10 not-disabled:hover:bg-ui-text/[0.1]",
  solid: "bg-ui-text text-background not-disabled:hover:opacity-90",
  brand: "bg-alt text-white not-disabled:hover:bg-alt/90",
  ghost: "text-ui-text-muted not-disabled:hover:bg-ui-text/[0.07] not-disabled:hover:text-ui-text",
  danger:
    "bg-red-500/10 text-red-500 ring-1 ring-inset ring-red-500/20 not-disabled:hover:bg-red-500/15",
  white: "bg-white text-black not-disabled:hover:bg-white/90",
  glass:
    "bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur-md not-disabled:hover:bg-white/25",
  primary: "",
  secondary: "",
  yellow: "",
};
COLORS.primary = COLORS.neutral;
COLORS.secondary = COLORS.brand;
COLORS.yellow = `${COLORS.neutral} [&_svg]:text-yellow-400`;

const SIZES = {
  sm: "h-8 px-3 text-[13px]",
  normal: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

const ICON_ONLY_SIZES = {
  sm: "w-8 !px-0",
  normal: "w-10 !px-0",
  lg: "w-12 !px-0",
};

const classes = computed(() => [
  COLORS[color],
  SIZES[size],
  !label && !allowRemove ? ICON_ONLY_SIZES[size] : "",
]);

const hasFormErrors = inject<ComputedRef<boolean>>(
  HAS_FORM_ERRORS_SYMBOL,
  computed(() => false),
);
</script>

<template>
  <component
    class="focus-visible:outline-alt inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,opacity,transform,color] focus-visible:outline-2 focus-visible:outline-offset-2 not-disabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    :is="component"
    :to="to"
    :class="[...classes, ui?.root]"
    :disabled="to ? undefined : hasFormErrors || disabled || loading"
    :type="resolvedType"
    :external="to ? external : undefined"
    :target="to && newTab ? '_blank' : undefined"
    :rel="to && newTab ? 'noopener noreferrer' : undefined"
  >
    <Icon v-if="loading" name="lucide:loader-circle" class="shrink-0 animate-spin" />
    <Icon
      v-else-if="icon"
      :name="icon"
      class="shrink-0"
      :class="{ 'text-lg': iconSize === 'lg' }"
    />

    <span v-if="tag" class="text-ui-text-muted text-[11px]">
      {{ tag }}
    </span>

    <span v-if="label">
      {{ label }}
    </span>

    <span v-if="allowRemove" class="text-ui-text-muted flex items-center">
      <Icon name="lucide:x" />
    </span>
  </component>
</template>
