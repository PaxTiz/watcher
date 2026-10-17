<script lang="ts" setup>
defineProps<{ title: string; description?: string }>();
defineSlots<{ icon?: () => unknown; default?: () => unknown; description?: () => unknown }>();
</script>

<template>
  <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
    <div class="flex min-w-0 flex-1 items-center gap-4">
      <slot name="icon" />
      <div class="min-w-0">
        <p class="text-ui-text text-sm font-medium">{{ title }}</p>
        <p
          v-if="description || $slots.description"
          class="text-ui-text-muted mt-0.5 truncate text-sm"
        >
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <slot />
    </div>
  </div>
</template>
