<script lang="ts" setup>
const { index = 0 } = defineProps<{
  index?: number;
}>();
</script>

<template>
  <Card
    size="flat"
    class="shimmer shadow-ui-border overflow-hidden border-2 border-transparent shadow"
    :style="{ '--shimmer-delay': `${index * 150}ms` }"
  >
    <!-- Image Placeholder -->
    <div class="bg-ui-border/20 relative aspect-video w-full">
      <!-- Duration Placeholder -->
      <div class="bg-ui-border/30 absolute right-1.5 bottom-1.5 h-5 w-12 rounded" />

      <!-- Progress Bar Placeholder -->
      <div class="bg-ui-border/40 absolute bottom-0 left-0 h-1 w-[40%]" />
    </div>

    <!-- Details Placeholder -->
    <div class="grid grid-cols-[2rem_1fr_2rem] gap-4 p-4">
      <!-- Channel Logo -->
      <div class="bg-ui-border/30 size-8 rounded" />

      <!-- Text Details -->
      <div class="-mt-0.5 space-y-3">
        <!-- Title Lines -->
        <div class="space-y-2">
          <div class="bg-ui-border/40 h-5 w-full rounded" />
          <div class="bg-ui-border/40 h-5 w-[85%] rounded" />
        </div>

        <!-- Metadata -->
        <div class="flex items-center gap-2">
          <!-- Service Icon -->
          <div class="bg-ui-border/25 size-4 rounded" />
          <!-- Channel Name -->
          <div class="bg-ui-border/25 h-4 w-24 rounded" />
          <!-- Separator -->
          <span class="bg-ui-border/25 size-1 shrink-0 rounded-full" />
          <!-- Date -->
          <div class="bg-ui-border/25 h-4 w-16 rounded" />
        </div>
      </div>

      <!-- Actions Placeholder -->
      <div class="bg-ui-border/20 size-8 rounded" />
    </div>
  </Card>
</template>
