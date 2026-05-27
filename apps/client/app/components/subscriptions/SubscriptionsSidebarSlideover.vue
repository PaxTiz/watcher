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
  <Slideover side="left" :ui="{ content: 'max-w-xs' }">
    <div class="flex h-full flex-col">
      <div class="mb-8 flex items-center justify-between">
        <h2 class="text-xl font-bold">Abonnements</h2>
      </div>

      <div class="flex-1 overflow-y-auto pr-2">
        <SubscriptionsSidebar class="!sticky-0 !h-auto !w-full !pr-0" />
      </div>
    </div>
  </Slideover>
</template>
