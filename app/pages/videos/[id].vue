<script lang="ts" setup>
const route = useRoute();

const { data } = await useFetch(`/api/videos/${route.params.id}`);
</script>

<template>
  <VideoPlayer :video="data" />

  <VideoMeta :video="data" class="mt-8" />
</template>
