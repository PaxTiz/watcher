<script lang="ts" setup>
const { data } = useSubscriptions();
</script>

<template>
  <SubscriptionsList :subscriptions="data ?? []" />
</template>
