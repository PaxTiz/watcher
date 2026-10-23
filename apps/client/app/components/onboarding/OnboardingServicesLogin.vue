<script lang="ts" setup>
const { t } = useI18n();
const { integrations } = useIntegrations();
</script>

<template>
  <OnboardingStep
    :step="1"
    :title="t('onboarding.link.title')"
    :description="t('onboarding.link.description')"
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
