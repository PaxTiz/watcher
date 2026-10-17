<script lang="ts" setup>
const close = inject<() => void>("__CLOSE__");
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    close?.();
  },
);
</script>

<template>
  <WatcherSlideover side="left" :ui="{ content: 'max-w-[85%] w-80', body: 'py-2' }">
    <AppSidebar class="h-full" />
  </WatcherSlideover>
</template>
