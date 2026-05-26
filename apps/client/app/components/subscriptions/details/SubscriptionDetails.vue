<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

defineProps<{ subscription: SubscriptionResource }>();
</script>

<template>
  <SubscriptionDetailsHeader :subscription="subscription" />

  <SubscriptionDetailsVideos :subscription="subscription" />
</template>
