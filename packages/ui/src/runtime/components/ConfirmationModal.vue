<script lang="ts" setup>
import Button from "./Button.vue";
import Modal from "./Modal.vue";

const {
  title = "Are you sure?",
  description = "This action cannot be undone. Please confirm you want to proceed.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
} = defineProps<{
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}>();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <Modal :ui="{ body: 'w-full max-w-[420px]' }">
    <h2 class="text-ui-text text-lg font-semibold">{{ title }}</h2>
    <p class="text-ui-text-muted mt-2 text-sm leading-relaxed">
      {{ description }}
    </p>

    <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button :label="cancelLabel" color="ghost" @click="emit('close', false)" />
      <Button
        :label="confirmLabel"
        :color="danger ? 'danger' : 'solid'"
        @click="emit('close', true)"
      />
    </div>
  </Modal>
</template>
