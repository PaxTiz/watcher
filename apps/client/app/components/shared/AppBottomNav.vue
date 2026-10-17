<script lang="ts" setup>
import { LazySubscriptionsSidebarSlideover } from "#components";

const route = useRoute();
const overlay = useWatcherOverlay();

const is_favorites_feed = computed(
  () => route.path === "/videos" && route.query.is_favorite === "true",
);

const navItems = computed(() => [
  { label: "Accueil", to: "/", icon: "lucide:house", active: route.path === "/" },
  {
    label: "Vidéos",
    to: "/videos",
    icon: "lucide:clapperboard",
    active: route.path.startsWith("/videos") && !is_favorites_feed.value,
  },
  {
    label: "Favoris",
    to: { path: "/videos", query: { is_favorite: "true" } },
    icon: "lucide:star",
    active: is_favorites_feed.value,
  },
]);

const open_subscriptions = () => {
  overlay.create(LazySubscriptionsSidebarSlideover).open();
};
</script>

<template>
  <nav
    class="bg-ui-bg/80 border-ui-border pb-safe fixed bottom-0 left-0 z-50 grid w-full grid-cols-4 border-t pt-2 backdrop-blur-xl lg:hidden"
    aria-label="Navigation principale"
  >
    <NuxtLink
      v-for="item in navItems"
      :key="item.label"
      :to="item.to"
      :aria-current="item.active ? 'page' : undefined"
      class="flex flex-col items-center gap-0.5 transition-colors"
      :class="item.active ? 'text-alt' : 'text-ui-text-muted'"
    >
      <Icon :name="item.icon" class="text-xl" />
      <span class="text-[11px] font-semibold">{{ item.label }}</span>
    </NuxtLink>

    <button
      class="text-ui-text-muted flex flex-col items-center gap-0.5 transition-colors"
      :class="{ 'text-alt': route.path.startsWith('/subscriptions') }"
      @click="open_subscriptions"
    >
      <Icon name="lucide:users" class="text-xl" />
      <span class="text-[11px] font-semibold">Abonnements</span>
    </button>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
}
</style>
