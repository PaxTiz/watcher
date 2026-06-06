<script lang="ts" setup>
const route = useRoute();

const showSidebar = computed(() => {
  return (
    route.name &&
    ([pages.home, pages.videos_index] as Array<string>).includes(route.name.toString())
  );
});
</script>

<template>
  <AppHeader />

  <main
    :class="
      route.name === pages.videos_single
        ? ['w-full', 'pt-0', 'pb-24', 'md:pb-8']
        : ['container', 'flex', 'gap-8', 'pt-6', 'pb-24', 'md:pt-8', 'md:pb-8']
    "
  >
    <SubscriptionsSidebar v-if="showSidebar" class="hidden lg:block" />

    <div
      :class="
        route.name === pages.videos_single ? ['w-full'] : ['min-w-0', 'flex-1', 'px-2', 'md:px-0']
      "
    >
      <NuxtPage />
    </div>
  </main>

  <AppBottomNav />
</template>
