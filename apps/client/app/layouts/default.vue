<script lang="ts" setup>
const route = useRoute();

// The video page needs the full width, its sidebar stays reachable from the header menu
const is_video_page = computed(() => (route.name as string) === pages.videos_single);
</script>

<template>
  <AppHeader :always-show-menu="is_video_page" />

  <div class="flex">
    <AppSidebar
      v-if="!is_video_page"
      class="sticky top-[var(--header-height)] hidden h-[calc(100dvh-var(--header-height))] w-64 shrink-0 border-r border-[var(--navbar-border)] lg:flex"
    />

    <main
      class="min-w-0 flex-1 pb-24 lg:pb-12"
      :class="is_video_page ? [] : ['px-4', 'pt-6', 'md:px-8', 'md:pt-8']"
    >
      <div :class="is_video_page ? [] : ['mx-auto', 'max-w-[1760px]']">
        <NuxtPage />
      </div>
    </main>
  </div>

  <AppBottomNav />
</template>
