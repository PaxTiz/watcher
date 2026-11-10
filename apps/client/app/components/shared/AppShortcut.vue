<script lang="ts" setup>
import type { ShortcutName } from "~/utils/shortcuts";

const { name } = defineProps<{ name: ShortcutName }>();

const { label } = useShortcutHints();
</script>

<template>
  <WatcherKbd aria-hidden="true">{{ label(name) }}</WatcherKbd>
</template>
