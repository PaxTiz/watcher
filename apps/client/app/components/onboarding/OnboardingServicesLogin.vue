<script lang="ts" setup>
const { integrations } = useIntegrations();
</script>

<template>
  <OnboardingStep
    :step="1"
    title="Associez vos comptes"
    description="Liez les plateformes de votre choix pour regrouper tous vos abonnements."
  >
    <div
      class="bg-ui-bg divide-ui-border divide-y overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--ui-border)]"
    >
      <SettingsIntegrationCard
        v-for="integration in integrations"
        :key="integration.id"
        :integration="integration"
      />
    </div>
  </OnboardingStep>
</template>
