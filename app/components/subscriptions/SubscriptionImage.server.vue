<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

defineProps<{ subscription: SubscriptionResource }>();
</script>

<template>
  <NuxtImg
    class="border-ui-border w-full rounded border"
    loading="lazy"
    format="avif,webp"
    width="71"
    height="71"
    densities="x1"
    :src="subscription.channel.logo"
    :alt="`Logo de ${subscription.name}`"
  />
</template>
