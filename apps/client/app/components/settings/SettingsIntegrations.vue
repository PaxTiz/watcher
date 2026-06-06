<script lang="ts" setup>
const { integrations } = useIntegrations();
</script>

<template>
  <section>
    <h2 class="text-ui-text text-2xl font-semibold">Comptes liés</h2>
    <p class="text-ui-text-muted">Liez vos comptes sociaux pour synchroniser vos abonnements.</p>

    <Card class="mt-6 p-6">
      <div class="space-y-4">
        <SettingsIntegrationCard
          v-for="integration in integrations"
          :key="integration.id"
          :integration="integration"
        />
      </div>
    </Card>
  </section>
</template>
