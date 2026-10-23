<script lang="ts" setup>
const { t } = useI18n();
const { dates } = useFormatter();
const { user } = useUserSession();
const { data: subscriptions } = useSubscriptions();

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
  <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
    <h1 class="page-title">{{ t("dashboard.greeting", { name: user?.name ?? "" }) }}</h1>

    <p v-if="lastSyncedAt" class="text-ui-text-muted flex items-center gap-1.5 text-sm">
      <Icon name="lucide:refresh-cw" />
      {{ t("dashboard.synced_ago", { ago: dates.ago(lastSyncedAt) }) }}
    </p>
  </div>
</template>
