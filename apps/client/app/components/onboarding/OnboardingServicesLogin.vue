<script lang="ts" setup>
const { integrations, is_linked, on_link } = useIntegrations();
</script>

<template>
  <Card class="mb-6 p-6">
    <div class="mb-6">
      <h2 class="text-ui-text flex items-center gap-2 text-xl font-bold">
        <span
          class="bg-alt/10 text-alt flex size-7 items-center justify-center rounded text-sm font-bold"
        >
          1
        </span>
        Associez vos comptes
      </h2>
      <p class="text-ui-text-muted mt-2 text-sm">
        Liez les integrations de votre choix pour regrouper tous vos abonnements.
      </p>
    </div>

    <div class="space-y-4">
      <div
        v-for="integration in integrations"
        :key="integration.id"
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
          </div>
        </div>

        <div class="flex items-center justify-end">
          <span
            v-if="is_linked(integration.id)"
            class="inline-flex items-center gap-1.5 rounded border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500"
          >
            <span class="size-1.5 rounded bg-green-500"></span>
            Connecté
          </span>

          <Button
            v-else
            label="Associer"
            size="sm"
            color="primary"
            class="w-full sm:w-auto"
            @click="on_link(integration)"
          />
        </div>
      </div>
    </div>
  </Card>
</template>
