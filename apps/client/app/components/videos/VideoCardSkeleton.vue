<script lang="ts" setup>
const { index = 0 } = defineProps<{
  index?: number;
}>();
</script>

<template>
  <div aria-hidden="true" :style="{ '--shimmer-delay': `${index * 150}ms` }">
    <div class="shimmer bg-ui-border/40 aspect-video w-full rounded-xl" />

    <div class="mt-3 flex gap-3 pr-8">
      <div class="shimmer bg-ui-border/40 size-9 shrink-0 rounded-full" />

      <div class="flex-1 space-y-2 pt-0.5">
        <div class="shimmer bg-ui-border/40 h-4 w-full rounded" />
        <div class="shimmer bg-ui-border/40 h-4 w-3/4 rounded" />
        <div class="shimmer bg-ui-border/30 h-3.5 w-1/2 rounded" />
      </div>
    </div>
  </div>
</template>
