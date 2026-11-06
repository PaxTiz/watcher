<script lang="ts" setup>
import type { Integration } from "~/composables/useIntegrations";

const { hasPasskeys } = defineProps<{ hasPasskeys: boolean }>();

const emit = defineEmits<{ close: [boolean] }>();

const { t } = useI18n();
const { login, loading, is_supported } = usePasskeys();
const { integrations, is_linked } = useIntegrations();

const linked_integrations = computed(() => integrations.filter((e) => is_linked(e.id)));

const on_passkey = async () => {
  if (await login()) {
    emit("close", true);
  }
};

const on_integration = (integration: Integration) => {
  window.open(integration.reauthenticateUrl, "_self");
};
</script>

<template>
  <WatcherModal :ui="{ body: 'w-full max-w-[420px]' }">
    <h2 class="text-ui-text text-lg font-semibold">{{ t("reauthentication.title") }}</h2>
    <p class="text-ui-text-muted mt-2 text-sm leading-relaxed">
      {{ t("reauthentication.description") }}
    </p>

    <div class="mt-5 flex flex-col gap-2">
      <WatcherButton
        v-if="hasPasskeys && is_supported"
        :label="t('reauthentication.passkey')"
        icon="lucide:key-round"
        color="solid"
        :loading="loading"
        @click="on_passkey"
      />
      <WatcherButton
        v-for="integration in linked_integrations"
        :key="integration.id"
        :label="t('reauthentication.integration', { name: integration.name })"
        :icon="integration.icon"
        @click="on_integration(integration)"
      />
    </div>

    <div class="mt-6 flex justify-end">
      <WatcherButton :label="t('common.cancel')" color="ghost" @click="emit('close', false)" />
    </div>
  </WatcherModal>
</template>
