<script lang="ts" setup>
const {
  title = "Etes-vous sûr(e) ?",
  description = "Cette action ne peut pas être annulée. Veuillez confirmer votre choix de procéder à cette action.",
} = defineProps<{ title?: string; description?: string }>();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <Modal :ui="{ body: 'w-full max-w-[450px]' }">
    <div class="flex flex-col items-center">
      <h2 class="text-ui-text text-center text-2xl font-bold">{{ title }}</h2>
      <p class="text-ui-text mt-4 text-center">
        {{ description }}
      </p>

      <div class="mt-8 flex items-center gap-4">
        <Button label="Annuler" @click="emit('close', false)" />
        <Button label="Confirmer" color="secondary" @click="emit('close', true)" />
      </div>
    </div>
  </Modal>
</template>
