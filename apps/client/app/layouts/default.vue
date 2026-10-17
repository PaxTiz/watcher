<script lang="ts" setup>
const route = useRoute();

// The video page needs the width: it shows the rail unless unfolded for the visit
const is_video_page = computed(() => (route.name as string) === pages.videos_single);
const collapsed_preference = useCookie<boolean>("watcher-sidebar-collapsed", {
  default: () => false,
  maxAge: 3600 * 24 * 365,
});
const unfolded_on_video_page = ref(false);

const collapsed = computed(() =>
  is_video_page.value ? !unfolded_on_video_page.value : collapsed_preference.value,
);

const toggle_sidebar = () => {
  if (is_video_page.value) {
    unfolded_on_video_page.value = !unfolded_on_video_page.value;
  } else {
    collapsed_preference.value = !collapsed_preference.value;
  }
};

watch(is_video_page, () => {
  unfolded_on_video_page.value = false;
});

const scroller = useTemplateRef("scroller");
const { container } = useAppScroll();
onMounted(() => {
  container.value = scroller.value;
});

// The glass lens is recomputed on every frame while content moves under it: pause it during scroll
const { isScrolling } = useScroll(scroller, { idle: 150 });
watch(isScrolling, (scrolling) => {
  document.documentElement.toggleAttribute("data-scrolling", scrolling);
});
</script>

<template>
  <!-- Frame: the sidebar sits on it, the content lives in an inset panel -->
  <div class="flex h-dvh bg-[var(--frame)] lg:py-2 lg:pr-2">
    <AppSidebar
      class="dark hidden shrink-0 lg:flex"
      :collapsed="collapsed"
      @toggle="toggle_sidebar"
    />

    <div
      class="relative isolate min-w-0 flex-1 overflow-hidden bg-[var(--background)] lg:rounded-2xl lg:shadow-[0_0_0_1px_var(--panel-edge)]"
    >
      <div ref="scroller" class="relative isolate h-full overflow-y-auto overscroll-contain">
        <!-- Inside the scrolled content, so the light scrolls away with the top of the page -->
        <AppAmbient />

        <AppTopbar />

        <main
          class="pb-28 lg:pb-12"
          :class="is_video_page ? ['md:px-6'] : ['px-4', 'pt-1', 'md:px-8']"
        >
          <div :class="is_video_page ? [] : ['mx-auto', 'max-w-[1760px]']">
            <NuxtPage />
          </div>
        </main>
      </div>
    </div>
  </div>

  <AppBottomNav />
</template>
