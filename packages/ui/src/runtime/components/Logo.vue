<script lang="ts" setup>
const props = defineProps<{ to?: string | false; label?: string; initial?: string }>();

const to = props.to === false ? "#" : (props.to ?? "/");
const label = props.label ?? "Watcher";
const initial = props.initial ?? "W";
</script>

<template>
  <nuxt-link :to="to" class="flex cursor-pointer items-center gap-2">
    <div
      class="bg-alt text-ui-bg flex h-[32px] w-[32px] items-center justify-center rounded text-2xl font-bold"
    >
      {{ initial }}
    </div>

    <span class="text-ui-text text-lg font-semibold">{{ label }}</span>
  </nuxt-link>
</template>
