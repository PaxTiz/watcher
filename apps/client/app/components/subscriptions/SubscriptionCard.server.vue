<script lang="ts" setup>
import { NuxtLink } from "#components";
import type { SubscriptionResource } from "#shared/resources/subscriptions";

defineProps<{ subscription: SubscriptionResource }>();
</script>

<template>
  <Card
    class="bg-ui-bg focus:outline-alt block rounded border p-2"
    :tag="NuxtLink"
    :class="{
      'border-highlight': subscription.isFavorite,
      'border-ui-border': !subscription.isFavorite,
    }"
    :to="`/subscription/${subscription.slug}`"
    size="sm"
    target="_blank"
    external
  >
    <SubscriptionImage :subscription="subscription" />

    <p class="mt-2 flex items-center justify-center text-center text-xs text-slate-400">
      <Icon
        class="shrink-0"
        :name="subscription.channel.service === 'youtube' ? 'lucide:youtube' : 'lucide:twitch'"
      />

      <span class="ml-1 truncate">{{ subscription.name }}</span>
    </p>
  </Card>
</template>
