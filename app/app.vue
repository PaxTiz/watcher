<script lang="ts" setup>
const { data: subscriptions } = await useFetch("/api/subscriptions");
</script>

<template>
  <main class="container">
    <div class="flex flex-wrap justify-center gap-4">
      <SubscriptionCard
        v-for="subscription in subscriptions"
        :key="subscription.id"
        :subscription="subscription"
      />
    </div>
  </main>
</template>
