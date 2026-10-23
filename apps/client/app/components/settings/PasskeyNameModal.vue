<script lang="ts" setup>
import type { FormSubmitEvent } from "@watcher/ui";

import { type PasskeysValidators, passkeysValidatorsSchema } from "#shared/validators/passkeys";

const { name = "" } = defineProps<{
  title: string;
  confirmLabel: string;
  name?: string;
}>();

const emit = defineEmits<{ close: [string | undefined] }>();

const input = useTemplateRef("input");
const state = ref<PasskeysValidators["name"]["body"]>({ name });

const onSubmit = (event: FormSubmitEvent<typeof passkeysValidatorsSchema.name.body>) => {
  emit("close", event.data.name);
};

onMounted(() => {
  input.value?.focus();
});
</script>

<template>
  <WatcherModal :ui="{ body: 'w-full max-w-[420px]' }">
    <h2 class="text-ui-text text-lg font-semibold">{{ title }}</h2>
    <p class="text-ui-text-muted mt-2 text-sm leading-relaxed">
      Donnez-lui un nom pour la reconnaître facilement, par exemple l'appareil ou le gestionnaire de
      mots de passe qui la conserve.
    </p>

    <WatcherForm
      class="mt-5"
      method="POST"
      :state="state"
      :schema="passkeysValidatorsSchema.name.body"
      @submit="onSubmit"
    >
      <WatcherFormField label="Nom de la clé d'accès" name="name">
        <WatcherFormInput
          ref="input"
          v-model="state.name"
          placeholder="MacBook, iPhone, Bitwarden…"
          class="w-full"
        />
      </WatcherFormField>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <WatcherButton label="Annuler" color="ghost" @click="emit('close', undefined)" />
        <WatcherButton :label="confirmLabel" type="submit" color="solid" />
      </div>
    </WatcherForm>
  </WatcherModal>
</template>
