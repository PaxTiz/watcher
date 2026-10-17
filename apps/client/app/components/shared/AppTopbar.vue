<script lang="ts" setup>
import { LazySubscriptionsSidebarSlideover } from "#components";

const route = useRoute();
const router = useRouter();
const overlay = useWatcherOverlay();
const { label: page_label } = useBreadcrumb();

const crumb_pill = useTemplateRef("crumb_pill");
useLiquidGlass(crumb_pill);

const section = computed(() => {
  const name = route.name as string;

  if (name === pages.home) return { label: "Accueil", icon: "lucide:house", to: "/" };
  if (name === pages.videos_index && route.query.is_favorite === "true")
    return { label: "Favoris", icon: "lucide:star", to: "/videos?is_favorite=true" };
  if (name === pages.videos_index || name === pages.videos_single)
    return { label: "Vidéos", icon: "lucide:clapperboard", to: "/videos" };
  if (route.path.startsWith("/subscriptions"))
    return { label: "Abonnements", icon: "lucide:users", to: undefined };
  if (route.path.startsWith("/settings"))
    return { label: "Paramètres", icon: "lucide:settings", to: undefined };

  return null;
});

const can_go_back = computed(() => (route.name as string) !== pages.home);

const go_back = async () => {
  if (import.meta.client && window.history.state?.back) {
    router.back();
  } else {
    await navigateTo(section.value?.to ?? "/");
  }
};

const open_menu = () => {
  overlay.create(LazySubscriptionsSidebarSlideover).open();
};
</script>

<template>
  <div class="pointer-events-none sticky top-0 z-30 flex items-center gap-2 p-3 md:p-4">
    <button
      type="button"
      class="liquid-glass text-ui-text pointer-events-auto flex size-10 shrink-0 items-center justify-center rounded-full lg:hidden"
      aria-label="Ouvrir le menu"
      @click="open_menu"
    >
      <Icon name="lucide:menu" class="text-lg" />
    </button>

    <button
      v-if="can_go_back"
      type="button"
      class="liquid-glass text-ui-text pointer-events-auto hidden size-10 shrink-0 items-center justify-center rounded-full lg:flex"
      aria-label="Retour"
      @click="go_back"
    >
      <Icon name="lucide:chevron-left" class="text-lg" />
    </button>

    <nav
      v-if="section"
      ref="crumb_pill"
      aria-label="Fil d'Ariane"
      class="liquid-glass text-ui-text pointer-events-auto flex h-10 min-w-0 items-center gap-2 rounded-full px-4 text-sm"
    >
      <Icon :name="section.icon" class="text-ui-text-muted shrink-0" />
      <NuxtLink
        v-if="section.to && page_label"
        :to="section.to"
        class="text-ui-text-muted hover:text-ui-text shrink-0 transition-colors"
      >
        {{ section.label }}
      </NuxtLink>
      <span v-else class="shrink-0 font-medium">{{ section.label }}</span>

      <template v-if="page_label">
        <Icon name="lucide:chevron-right" class="text-ui-text-muted shrink-0 text-xs" />
        <span class="truncate font-medium">{{ page_label }}</span>
      </template>
    </nav>
  </div>
</template>
