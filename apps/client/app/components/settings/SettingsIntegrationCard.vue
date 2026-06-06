<script lang="ts" setup>
import type { Integration } from "~/composables/useIntegrations";

const { user } = useUserSession();
const { is_linked: is_integration_linked, on_link, on_disconnect } = useIntegrations();

const { integration } = defineProps<{ integration: Integration }>();

const is_linked = computed(() => is_integration_linked(integration.id));
</script>

<template>
  <div
    class="border-ui-border flex flex-col justify-between gap-4 rounded border p-4 sm:flex-row sm:items-center"
  >
    <div class="flex items-center gap-4">
      <div
        :class="[
          integration.bgColor,
          integration.color,
          'flex h-12 w-12 shrink-0 items-center justify-center rounded',
        ]"
      >
        <Icon :name="integration.icon" class="text-2xl" />
      </div>

      <div>
        <h3 class="text-ui-text font-semibold">{{ integration.name }}</h3>
        <p v-if="is_linked" class="text-ui-text-muted mt-1 font-mono text-xs">
          {{ user?.integrations?.[integration.id] }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3">
      <span
        v-if="is_linked"
        class="inline-flex items-center gap-1.5 rounded border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500"
      >
        <span class="size-1.5 rounded bg-green-500" />
        Connecté
      </span>

      <Button
        v-if="is_linked"
        label="Déconnecter"
        size="sm"
        @click="() => on_disconnect(integration)"
      />

      <Button
        v-else
        :label="`Associer`"
        size="sm"
        color="primary"
        class="w-full sm:w-auto"
        @click="on_link"
      />
    </div>
  </div>
</template>
