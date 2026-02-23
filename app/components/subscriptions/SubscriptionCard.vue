<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

defineProps<{ subscription: SubscriptionResource }>();
</script>

<template>
  <nuxt-link
    class="block p-2 bg-ui-bg rounded border focus:outline-alt"
    :class="{
      'border-highlight': subscription.isFavorite,
      'border-ui-border': !subscription.isFavorite,
    }"
    :to="subscription.channel.url"
    target="_blank"
    external
  >
    <img
      class="w-full rounded"
      loading="lazy"
      :src="subscription.channel.logo"
      :alt="`Logo de ${subscription.name}`"
    />
    <p class="flex items-center justify-center text-center text-xs text-slate-400 mt-2">
      <Icon
        class="shrink-0"
        :name="subscription.channel.service === 'youtube' ? 'lucide:youtube' : 'lucide:twitch'"
      />

      <span class="ml-1 truncate">{{ subscription.name }}</span>
    </p>
  </nuxt-link>
</template>
