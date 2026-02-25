<script lang="ts" setup>
const { data } = await useFetch("/api/videos");
</script>

<template>
  <VideosList :videos="data ?? []" />
</template>
