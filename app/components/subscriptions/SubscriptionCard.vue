<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

defineProps<{ subscription: SubscriptionResource }>();
</script>

<template>
  <nuxt-link
    class="block w-[calc(88px+1rem)] p-2 bg-ui-bg rounded focus:outline-alt"
    :to="subscription.channel.url"
    target="_blank"
    external
  >
    <img class="rounded" :src="subscription.channel.logo" :alt="`Logo de ${subscription.name}`" />
    <p class="flex items-center justify-center text-center text-xs text-slate-400 mt-2">
      <Icon
        class="shrink-0"
        :name="subscription.channel.service === 'youtube' ? 'lucide:youtube' : 'lucide:twitch'"
      />

      <span class="ml-1 truncate">{{ subscription.name }}</span>
    </p>
  </nuxt-link>
</template>
