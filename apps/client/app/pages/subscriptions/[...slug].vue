<script lang="ts" setup>
import { type VideoCurrentRefreshType, VIDEO_CURRENT_REFRESH_SYMBOL } from "@watcher/common";

const route = useRoute();
if (!route.params.slug) {
  throw createError({ status: 404 });
}

const slug = route.params.slug.toString();

const { data, refresh } = await useSubscription(slug);

provide<VideoCurrentRefreshType>(VIDEO_CURRENT_REFRESH_SYMBOL, refresh);

usePageNavigation()(() => [
  { label: "Chaînes", icon: "lucide:users" },
  { label: data.value?.name ?? "" },
]);

useMeta({
  title: () => data.value?.name ?? "",
  description: () => (data.value ? `Découvrez les dernières vidéos de ${data.value.name}.` : ""),
});
</script>

<template>
  <SubscriptionDetails v-if="data" :subscription="data" />
</template>
