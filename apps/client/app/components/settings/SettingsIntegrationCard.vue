<script lang="ts" setup>
import type { Integration } from "~/composables/useIntegrations";

const { user } = useUserSession();
const { is_linked: is_integration_linked, on_link, on_disconnect } = useIntegrations();

const { integration } = defineProps<{ integration: Integration }>();

const is_linked = computed(() => is_integration_linked(integration.id));

const status = computed(() => {
  if (!is_linked.value) {
    return "Non connecté";
  }

  if (integration.id === "bluesky" && user.value?.bluesky?.handle) {
    return `Connecté · @${user.value.bluesky.handle}`;
  }

  return "Connecté";
});
</script>

<template>
  <SettingsRow :title="integration.name">
    <template #icon>
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl"
        :class="[integration.bgColor, integration.color]"
      >
        <Icon :name="integration.icon" class="text-lg" />
      </span>
    </template>

    <template #description>
      <span class="inline-flex items-center gap-1.5">
        <span
          class="size-1.5 rounded-full"
          :class="is_linked ? 'bg-green-500' : 'bg-ui-text-muted/50'"
        />
        {{ status }}
      </span>
    </template>

    <WatcherButton
      v-if="is_linked"
      label="Déconnecter"
      size="sm"
      color="ghost"
      @click="on_disconnect(integration)"
    />
    <WatcherButton v-else label="Associer" size="sm" color="solid" @click="on_link(integration)" />
  </SettingsRow>
</template>
