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
  <Slideover side="right" :ui="{ content: 'w-full max-w-[500px]' }">
    <LoginForm :title="title" :description="description" :button="button" :link="link" />

    <Button label="Annuler" class="w-full" @click="emit('close')" />
  </Slideover>
</template>
