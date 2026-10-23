<script lang="ts" setup>
import { type VideoCurrentRefreshType, VIDEO_CURRENT_REFRESH_SYMBOL } from "@watcher/common";

const { t } = useI18n();
const route = useRoute();
if (!route.params.slug) {
  throw createError({ status: 404 });
}

const slug = route.params.slug.toString();

const { data, refresh } = await useSubscription(slug);

provide<VideoCurrentRefreshType>(VIDEO_CURRENT_REFRESH_SYMBOL, refresh);

usePageNavigation()(() => [
  { label: t("nav.channels"), icon: "lucide:users" },
  { label: data.value?.name ?? "" },
]);

useMeta({
  title: () => data.value?.name ?? "",
  description: () => (data.value ? t("subscriptions.discover", { name: data.value.name }) : ""),
});
</script>

<template>
  <SubscriptionDetails v-if="data" :subscription="data" />
</template>
