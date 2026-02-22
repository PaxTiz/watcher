<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";
import { NuxtLink } from "#components";

const { to } = defineProps<{
  label: string;
  to?: RouteLocationRaw;
}>();

const component = computed(() => (to ? NuxtLink : "button"));
</script>

<template>
  <component
    :is="component"
    :to="to"
    class="bg-ui-border text-ui-text text-sm py-2 px-4 rounded border border-transparent hover:border-alt hover:text-alt hover:opacity-75 transition-all duration-300 cursor-pointer"
  >
    {{ label }}
  </component>
</template>
