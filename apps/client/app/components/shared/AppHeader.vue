<script lang="ts" setup>
import { LazySubscriptionsSidebarSlideover } from "#components";

const { alwaysShowMenu = false } = defineProps<{ alwaysShowMenu?: boolean }>();

const route = useRoute();
const overlay = useWatcherOverlay();

const is_videos_page = computed(() => (route.name as string) === pages.videos_index);

const search = ref(is_videos_page.value ? ((route.query.query as string) ?? "") : "");
const show_mobile_search = ref(false);

const capsule = useTemplateRef("capsule");
useLiquidGlass(capsule);

watch(
  () => route.query.query,
  (query) => {
    if (is_videos_page.value) {
      search.value = (query as string) ?? "";
    }
  },
);

const go_to_results = async () => {
  const query = search.value.trim() || undefined;

  // Keep the other active filters when searching from the videos page
  await navigateTo(
    {
      path: "/videos",
      query: is_videos_page.value ? { ...route.query, page: 1, query } : { query },
    },
    { replace: is_videos_page.value },
  );
};

// Live search only makes sense when results are already on screen
const on_input = useDebounceFn(async () => {
  if (is_videos_page.value) {
    await go_to_results();
  }
}, 300);

const clear_search = async () => {
  search.value = "";
  if (is_videos_page.value) {
    await go_to_results();
  }
};

const open_sidebar = () => {
  overlay.create(LazySubscriptionsSidebarSlideover).open();
};
</script>

<template>
  <div class="sticky top-0 z-50 px-3 pt-3 md:px-6">
    <header
      ref="capsule"
      class="liquid-glass relative flex h-14 items-center gap-2 rounded-full px-2"
    >
      <button
        class="text-ui-text hover:bg-ui-text/10 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors"
        :class="{ 'lg:hidden': !alwaysShowMenu }"
        aria-label="Ouvrir le menu"
        @click="open_sidebar"
      >
        <Icon name="lucide:menu" class="text-xl" />
      </button>

      <WatcherLogo
        class="[&_span]:font-display shrink-0 pr-2 [&_span]:text-base"
        :class="{ 'lg:hidden': !alwaysShowMenu }"
      />

      <form
        role="search"
        class="mx-auto hidden w-full max-w-xl sm:block"
        :class="{
          'absolute inset-x-2 top-1/2 z-10 !block -translate-y-1/2 sm:static sm:translate-y-0':
            show_mobile_search,
        }"
        @submit.prevent="go_to_results"
      >
        <label class="group relative flex items-center">
          <span class="sr-only">Rechercher une vidéo</span>
          <Icon
            name="lucide:search"
            class="text-ui-text-muted group-focus-within:text-alt pointer-events-none absolute left-3.5 transition-colors"
          />
          <input
            v-model="search"
            type="search"
            placeholder="Rechercher une vidéo"
            class="h-10 w-full !rounded-full !border-transparent !bg-[var(--glass-input)] !pr-10 !pl-10 shadow-[inset_0_1px_2px_rgb(0_0_0/0.2)] [&::-webkit-search-cancel-button]:hidden"
            @input="on_input"
            @keydown.esc="show_mobile_search = false"
          />
          <button
            v-if="search || show_mobile_search"
            type="button"
            class="text-ui-text-muted hover:text-ui-text absolute right-3 flex"
            :aria-label="search ? 'Effacer la recherche' : 'Fermer la recherche'"
            @click="search ? clear_search() : (show_mobile_search = false)"
          >
            <Icon name="lucide:x" />
          </button>
        </label>
      </form>

      <div class="ml-auto flex items-center gap-1 sm:ml-0">
        <button
          class="text-ui-text hover:bg-ui-text/10 flex size-10 items-center justify-center rounded-full transition-colors sm:hidden"
          aria-label="Rechercher"
          @click="show_mobile_search = true"
        >
          <Icon name="lucide:search" class="text-xl" />
        </button>

        <UserDropdown />
      </div>
    </header>
  </div>
</template>
