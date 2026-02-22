<script lang="ts" setup>
const { data } = useFetch("/api/subscriptions");
</script>

<template>
  <NuxtLoadingIndicator />

  <main class="container py-16">
    <SubscriptionsList :subscriptions="data ?? []" />
  </main>
</template>
