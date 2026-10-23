<script lang="ts" setup>
import { useI18n } from "#imports";

import Button from "./Button.vue";
import Modal from "./Modal.vue";

const {
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
} = defineProps<{
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const { t } = useI18n();
</script>

<template>
  <Modal :ui="{ body: 'w-full max-w-[420px]' }">
    <h2 class="text-ui-text text-lg font-semibold">{{ title ?? t("ui.confirm.title") }}</h2>
    <p class="text-ui-text-muted mt-2 text-sm leading-relaxed">
      {{ description ?? t("ui.confirm.description") }}
    </p>

    <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        :label="cancelLabel ?? t('common.cancel')"
        color="ghost"
        @click="emit('close', false)"
      />
      <Button
        :label="confirmLabel ?? t('common.confirm')"
        :color="danger ? 'danger' : 'solid'"
        @click="emit('close', true)"
      />
    </div>
  </Modal>
</template>
