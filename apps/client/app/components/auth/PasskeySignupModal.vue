<script lang="ts" setup>
import type { FormSubmitEvent } from "@watcher/ui";

import { type PasskeysValidators, passkeysValidatorsSchema } from "#shared/validators/passkeys";

const emit = defineEmits<{ close: [] }>();

const { signup, loading } = usePasskeys();

const input = useTemplateRef("input");
const state = ref<PasskeysValidators["signup"]["body"]>({
  name: "",
  passkey_name: "",
});

const onSubmit = async (event: FormSubmitEvent<typeof passkeysValidatorsSchema.signup.body>) => {
  if (await signup(event.data.name, event.data.passkey_name)) {
    emit("close");
    await navigateTo("/");
  }
};

onMounted(() => {
  input.value?.focus();
});
</script>

<template>
  <WatcherSlideover side="right" :ui="{ content: 'w-full max-w-[500px]' }">
    <section>
      <h1 class="page-title">Créer un compte avec une clé d'accès</h1>
      <p class="text-ui-text-muted mt-2">
        Votre clé d'accès est enregistrée sur votre appareil ou dans votre gestionnaire de mots de
        passe. Aucun mot de passe à retenir.
      </p>

      <WatcherForm
        class="mt-6"
        method="POST"
        :state="state"
        :schema="passkeysValidatorsSchema.signup.body"
        @submit="onSubmit"
      >
        <WatcherFormField label="Votre nom" name="name">
          <WatcherFormInput ref="input" v-model="state.name" placeholder="Jean" class="w-full" />
        </WatcherFormField>

        <WatcherFormField label="Nom de la clé d'accès" name="passkey_name" class="mt-4">
          <WatcherFormInput
            v-model="state.passkey_name"
            placeholder="MacBook, iPhone, Bitwarden…"
            class="w-full"
          />
        </WatcherFormField>

        <WatcherButton
          label="Créer mon compte"
          icon="lucide:key-round"
          type="submit"
          color="solid"
          size="lg"
          class="mt-5 w-full"
          :loading="loading"
        />
      </WatcherForm>
    </section>

    <WatcherButton label="Annuler" color="ghost" size="lg" class="w-full" @click="emit('close')" />
  </WatcherSlideover>
</template>
