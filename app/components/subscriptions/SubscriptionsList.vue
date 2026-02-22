<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

const { subscriptions } = defineProps<{ subscriptions: Array<SubscriptionResource> }>();

const filtered = ref(subscriptions);
const filter = ref({
  name: "",
  service: "",
});

watchDebounced(
  filter,
  (f) => {
    const n = f.name.toLowerCase();
    filtered.value = subscriptions.filter((sub) => {
      const name = sub.name.toLowerCase();
      return name.includes(n) && sub.channel.service.includes(f.service);
    });
  },
  { debounce: 150, deep: true },
);
</script>

<template>
  <div class="flex gap-4 mb-8">
    <input v-model="filter.name" placeholder="Rechercher par nom.." class="flex-1" />

    <select v-model="filter.service" name="" id="">
      <option value="">Tous les services</option>
      <option value="youtube">YouTube</option>
      <option value="twitch">Twitch</option>
    </select>
  </div>

  <div class="flex flex-wrap justify-between gap-4">
    <SubscriptionCard
      v-for="subscription in filtered"
      :key="subscription.id"
      :subscription="subscription"
    />
  </div>
</template>
