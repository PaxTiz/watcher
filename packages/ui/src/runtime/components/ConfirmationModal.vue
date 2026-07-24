<script lang="ts" setup>
import Button from "./Button.vue";
import Modal from "./Modal.vue";

const {
  title = "Are you sure?",
  description = "This action cannot be undone. Please confirm you want to proceed.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
} = defineProps<{
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}>();

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
        <Button :label="cancelLabel" @click="emit('close', false)" />
        <Button :label="confirmLabel" color="secondary" @click="emit('close', true)" />
      </div>
    </div>
  </Modal>
</template>
