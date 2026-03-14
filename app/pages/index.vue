<script lang="ts" setup>
const { data } = useSubscriptions();
</script>

<template>
  <SubscriptionsCarousel :subscriptions="data ?? []" />
</template>
