<script lang="ts" setup>
import { type VideoCurrentRefreshType, VIDEO_CURRENT_REFRESH_SYMBOL } from "#shared/types/videos";

const route = useRoute();
const slug = route.params.slug as string;

const { data, refresh } = await useSubscription(slug);

provide<VideoCurrentRefreshType>(VIDEO_CURRENT_REFRESH_SYMBOL, refresh);

useMeta({
  title: () => data.value?.name ?? "",
  description: () => (data.value ? `Découvrez les dernières vidéos de ${data.value.name}.` : ""),
});
</script>

<template>
  <SubscriptionDetails v-if="data" :subscription="data" />
</template>
