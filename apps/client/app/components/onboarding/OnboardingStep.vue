<script lang="ts" setup>
defineProps<{ step: number; title: string; description: string }>();
</script>

<template>
  <div>
    <div class="flex items-start gap-3">
      <span
        class="bg-alt/15 text-alt mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      >
        {{ step }}
      </span>
      <div>
        <h2 class="text-ui-text font-medium">{{ title }}</h2>
        <p class="text-ui-text-muted mt-0.5 text-sm">{{ description }}</p>
      </div>
    </div>

    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
