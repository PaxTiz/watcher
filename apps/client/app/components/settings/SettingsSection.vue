<script lang="ts" setup>
defineProps<{ title: string; description?: string; danger?: boolean }>();
</script>

<template>
  <section class="grid gap-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-10">
    <div>
      <h2 class="text-ui-text font-medium" :class="{ 'text-red-500': danger }">{{ title }}</h2>
      <p v-if="description" class="text-ui-text-muted mt-1 text-sm">{{ description }}</p>
    </div>

    <div
      class="bg-ui-bg divide-ui-border divide-y overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--ui-border)]"
      :class="{ 'shadow-[0_0_0_1px_rgb(239_68_68/0.3)]': danger }"
    >
      <slot />
    </div>
  </section>
</template>
