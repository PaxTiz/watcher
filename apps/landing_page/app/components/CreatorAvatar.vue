<script lang="ts" setup>
const { size = 30 } = defineProps<{ initials: string; color: string; size?: number }>();
</script>

<template>
  <span
    class="relative flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      fontSize: `${Math.round(size * 0.36)}px`,
    }"
  >
    {{ initials }}
    <slot />
  </span>
</template>
