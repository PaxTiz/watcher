<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

const { data } = await useAppFetch<Array<SubscriptionResource>>("/api/subscriptions");
</script>

<template>
  <SubscriptionsList :subscriptions="data ?? []" />
</template>
