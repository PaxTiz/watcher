<script lang="ts" setup>
const { integrations } = useIntegrations();
</script>

<template>
  <section>
    <h2 class="text-ui-text text-2xl font-semibold">Comptes liés</h2>
    <p class="text-ui-text-muted">Liez vos comptes sociaux pour synchroniser vos abonnements.</p>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SettingsIntegrationCard
        v-for="integration in integrations"
        :key="integration.id"
        :integration="integration"
      />
    </div>
  </section>
</template>
