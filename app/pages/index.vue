<script lang="ts" setup>
const { data } = await useFetch("/api/subscriptions");
</script>

<template>
  <SubscriptionsList :subscriptions="data ?? []" />
</template>
