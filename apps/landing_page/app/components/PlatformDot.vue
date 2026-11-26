<script lang="ts" setup>
import type { Platform } from "~/utils/preview";

const { size = 8 } = defineProps<{ platform: Platform; size?: number }>();
</script>

<template>
  <span
    class="shrink-0 rounded-[2px]"
    :style="{ width: `${size}px`, height: `${size}px`, background: PLATFORM_COLORS[platform] }"
  />
</template>
