<script lang="ts" setup>
import type { SubscriptionResource } from "@watcher/common";

defineProps<{ subscription: SubscriptionResource }>();

const { t } = useI18n();
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
    :alt="t('subscriptions.logo', { name: subscription.name })"
  />
</template>
