<script lang="ts" setup>
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Slideover side="right" :ui="{ content: 'w-full max-w-[30%]' }">
    <LoginForm />

    <Button label="Annuler" class="w-full" @click="emit('close')" />
  </Slideover>
</template>
