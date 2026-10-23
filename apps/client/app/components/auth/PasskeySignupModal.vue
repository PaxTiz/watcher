<script lang="ts" setup>
import type { FormSubmitEvent } from "@watcher/ui";

import { type PasskeysValidators, passkeysValidatorsSchema } from "#shared/validators/passkeys";

const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
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
      <h1 class="page-title">{{ t("auth.signup.title") }}</h1>
      <p class="text-ui-text-muted mt-2">{{ t("auth.signup.description") }}</p>

      <WatcherForm
        class="mt-6"
        method="POST"
        :state="state"
        :schema="passkeysValidatorsSchema.signup.body"
        @submit="onSubmit"
      >
        <WatcherFormField :label="t('auth.signup.name')" name="name">
          <WatcherFormInput
            ref="input"
            v-model="state.name"
            :placeholder="t('auth.signup.name_placeholder')"
            class="w-full"
          />
        </WatcherFormField>

        <WatcherFormField :label="t('passkeys.name')" name="passkey_name" class="mt-4">
          <WatcherFormInput
            v-model="state.passkey_name"
            :placeholder="t('passkeys.name_placeholder')"
            class="w-full"
          />
        </WatcherFormField>

        <WatcherButton
          :label="t('auth.signup.submit')"
          icon="lucide:key-round"
          type="submit"
          color="solid"
          size="lg"
          class="mt-5 w-full"
          :loading="loading"
        />
      </WatcherForm>
    </section>

    <WatcherButton
      :label="t('common.cancel')"
      color="ghost"
      size="lg"
      class="w-full"
      @click="emit('close')"
    />
  </WatcherSlideover>
</template>
