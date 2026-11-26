<script lang="ts" setup>
const { size = "lg" } = defineProps<{
  id: string;
  number: string;
  label: string;
  title: string;
  size?: "md" | "lg";
}>();
</script>

<template>
  <div class="flex max-w-[760px] flex-col gap-4">
    <span class="text-ui-text-muted text-[13px] font-semibold tracking-[0.04em]">
      <span class="text-alt-text">{{ number }}</span
      >&nbsp;&nbsp;{{ label }}
    </span>
    <h2
      :id="id"
      class="section-title"
      :class="
        size === 'lg'
          ? 'text-[clamp(30px,4.2vw,60px)]'
          : 'text-[clamp(30px,3.6vw,50px)] leading-[1.06]'
      "
    >
      {{ title }}
    </h2>
    <slot />
  </div>
</template>
