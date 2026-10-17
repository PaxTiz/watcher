<script lang="ts" setup>
const route = useRoute();

// The video page needs the full width, its sidebar stays reachable from the header menu
const is_video_page = computed(() => (route.name as string) === pages.videos_single);
</script>

<template>
  <AppAmbient />

  <div class="flex min-h-dvh">
    <AppSidebar
      v-if="!is_video_page"
      class="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-[var(--navbar-border)] bg-[var(--background)]/50 lg:flex"
    />

    <div class="min-w-0 flex-1">
      <AppHeader :always-show-menu="is_video_page" />

      <main
        class="pb-24 lg:pb-12"
        :class="is_video_page ? ['pt-4', 'md:pt-6'] : ['px-4', 'pt-6', 'md:px-8', 'md:pt-8']"
      >
        <div :class="is_video_page ? [] : ['mx-auto', 'max-w-[1760px]']">
          <NuxtPage />
        </div>
      </main>
    </div>
  </div>

  <AppBottomNav />
</template>
