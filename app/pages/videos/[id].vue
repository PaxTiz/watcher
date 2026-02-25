<script lang="ts" setup>
const route = useRoute();
const id = Number(route.params.id);
</script>

<template>
  <VideoPlayer :id="id" />
</template>
