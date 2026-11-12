<script lang="ts" setup>
import type { SubscriptionResource } from "@watcher/common";

defineProps<{ subscription: SubscriptionResource }>();

const { t } = useI18n();
</script>

<template>
  <AppImage
    class="border-ui-border w-full rounded border"
    loading="lazy"
    width="71"
    height="71"
    :src="subscription.channel.logo"
    :alt="t('subscriptions.logo', { name: subscription.name })"
  />
</template>
