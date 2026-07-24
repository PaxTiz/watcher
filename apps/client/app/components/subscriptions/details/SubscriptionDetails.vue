<script lang="ts" setup>
import type { SubscriptionResource } from "@watcher/common";

defineProps<{ subscription: SubscriptionResource }>();
</script>

<template>
  <SubscriptionDetailsHeader :subscription="subscription" />

  <SubscriptionDetailsVideos :subscription="subscription" />
</template>
