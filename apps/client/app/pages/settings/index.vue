<script lang="ts" setup>
useMeta({ title: "Paramètres" });
</script>

<template>
  <SettingsHeader />

  <div class="mt-12 space-y-8">
    <SettingsIntegrations />

    <SettingsAccount />

    <SettingsActions />
  </div>
</template>
