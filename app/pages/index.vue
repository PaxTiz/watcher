<script lang="ts" setup>
const { data } = useSubscriptions();

useOAuthRedirectionHandler();
</script>

<template>
  <SubscriptionsCarousel :subscriptions="data ?? []" />
</template>
