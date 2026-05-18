<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

const { subscriptions } = defineProps<{ subscriptions: Array<SubscriptionResource> }>();

const filtered = ref(subscriptions);
const filter = ref({
  name: "",
  service: undefined,
});

watch(
  () => subscriptions,
  (s) => (filtered.value = s),
);
watchDebounced(
  filter,
  (f) => {
    const n = f.name.toLowerCase();
    filtered.value = subscriptions.filter((sub) => {
      if (!f.service) {
        return true;
      }

      const name = sub.name.toLowerCase();
      return name.includes(n) && sub.channel.service.includes(f.service);
    });
  },
  { debounce: 150, deep: true },
);
</script>

<template>
  <div class="mb-8 flex gap-4">
    <input v-model="filter.name" placeholder="Rechercher par nom.." class="flex-1" />

    <AppFormSelect
      v-model="filter.service"
      class="min-w-[150px]"
      placeholder="Tous les services"
      :items="[
        { label: 'YouTube', value: 'youtube' },
        { label: 'Twitch', value: 'twitch' },
      ]"
    />
  </div>

  <div class="infinite-grid-[88px] gap-4">
    <SubscriptionCard
      v-for="subscription in filtered"
      :key="subscription.id"
      :subscription="subscription"
    />
  </div>
</template>
