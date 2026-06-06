<script lang="ts" setup>
import type { Integration } from "~/composables/useIntegrations";

const { user } = useUserSession();
const { is_linked: is_integration_linked, on_link, on_disconnect } = useIntegrations();

const { integration } = defineProps<{ integration: Integration }>();

const is_linked = computed(() => is_integration_linked(integration.id));
</script>

<template>
  <Card class="flex flex-col justify-between">
    <div class="flex items-center gap-4">
      <div
        :class="[
          integration.color,
          'bg-ui-bg border-ui-border flex h-12 w-12 items-center justify-center rounded-full border',
        ]"
      >
        <Icon :name="integration.icon" class="text-2xl" />
      </div>
      <div>
        <h3 class="text-ui-text font-medium">{{ integration.name }}</h3>
        <p v-if="is_linked" class="text-xs text-green-400">Connecté</p>
        <p v-else class="text-ui-text-muted text-xs">Non connecté</p>
      </div>
    </div>

    <div class="mt-6">
      <template v-if="!is_linked">
        <Button
          :label="`Lier mon compte ${integration.name}`"
          size="sm"
          class="w-full"
          external
          @click="on_link"
        />
      </template>
      <template v-else>
        <div class="text-ui-text mb-4 text-sm">
          ID:
          <span class="font-mono text-xs opacity-50">
            {{ user?.integrations?.[integration.id] }}
          </span>
        </div>
        <Button
          label="Déconnecter"
          size="sm"
          class="w-full"
          @click="() => on_disconnect(integration)"
        />
      </template>
    </div>
  </Card>
</template>
