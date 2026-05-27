<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

defineProps<{ subscription: SubscriptionResource }>();
</script>

<template>
  <NuxtLink
    :to="`/subscriptions/${subscription.slug}`"
    class="group hover:bg-ui-border/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
    active-class="bg-alt/10! text-alt!"
  >
    <div class="relative shrink-0">
      <img
        :src="subscription.channel.logo"
        class="border-ui-border h-8 w-8 rounded-full border object-cover"
        :alt="subscription.name"
      />
      <div class="bg-ui-bg absolute -right-1 -bottom-1 rounded-full p-0.5 shadow-sm">
        <Icon
          :name="
            subscription.channel.service === 'youtube' ? 'fa7-brands:youtube' : 'fa7-brands:twitch'
          "
          class="block text-[10px]"
          :class="subscription.channel.service === 'youtube' ? 'text-red-500' : 'text-purple-500'"
        />
      </div>
    </div>
    <span class="truncate text-sm font-medium">{{ subscription.name }}</span>
  </NuxtLink>
</template>
