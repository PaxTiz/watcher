<script lang="ts" setup>
import type { VNode } from "vue";

defineSlots<{ default: () => VNode }>();
</script>

<template>
  <div class="group bg-ui-bg focus:outline-alt block rounded border p-4">
    <slot />
  </div>
</template>
