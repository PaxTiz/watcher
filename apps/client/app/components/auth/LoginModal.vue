<script lang="ts" setup>
const emit = defineEmits<{ close: [] }>();

defineProps<{
  title?: string;
  description?: string;
  button?: string;
  link?: boolean;
}>();
</script>

<template>
  <WatcherSlideover side="right" :ui="{ content: 'w-full max-w-[500px]' }">
    <LoginForm :title="title" :description="description" :button="button" :link="link" />

    <WatcherButton label="Annuler" color="ghost" size="lg" class="w-full" @click="emit('close')" />
  </WatcherSlideover>
</template>
