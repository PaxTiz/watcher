<script lang="ts" setup>
const { dates } = useFormatter();
const { data: subscriptions, refresh: refreshSubscriptions } = useSubscriptions();

const lastSyncedAt = computed(() => {
  if (!subscriptions.value || subscriptions.value.length === 0) return null;
  const syncDates = subscriptions.value
    .map((s) => (s.last_synced_at ? new Date(s.last_synced_at).getTime() : 0))
    .filter((t) => t > 0);

  if (syncDates.length === 0) return null;
  return new Date(Math.max(...syncDates)).toISOString();
});
</script>

<template>
  <div
    class="border-ui-border flex flex-col gap-4 border-b pb-8 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <h1 class="page-title">Tableau de bord</h1>
      <p class="text-ui-text-muted mt-1 text-sm font-medium md:text-base">
        Découvrez les dernières sorties de vos créateurs.
      </p>
    </div>

    <div
      v-if="lastSyncedAt"
      class="text-ui-text-muted flex items-center gap-2 text-xs font-medium md:text-sm"
    >
      <Icon name="lucide:history" class="text-base md:text-lg" />
      <span>Dernière synchronisation {{ dates.ago(lastSyncedAt) }}</span>
    </div>
  </div>
</template>
