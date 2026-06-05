<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";

const route = useRoute();
const { dates } = useFormatter();

const { data } = await useAppFetch<VideoResource>(`/api/videos/${route.params.id}`);

useMeta({
  title: () => data.value?.title ?? "",
  description: () =>
    data.value
      ? `Regarder la vidéo ${data.value.title} de ${data.value.author.name}, publiée le ${dates.format(data.value.created_at)}.`
      : "",
});
</script>

<template>
  <section v-if="data">
    <VideoPlayer :video="data" />

    <VideoMeta :video="data" class="mt-8" />
  </section>
</template>
