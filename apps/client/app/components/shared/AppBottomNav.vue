<script lang="ts" setup>
import { LazySubscriptionsSidebarSlideover } from "#components";

const { t } = useI18n();
const route = useRoute();
const overlay = useWatcherOverlay();

const is_favorites_feed = computed(
  () => route.path === "/videos" && route.query.is_favorite === "true",
);

const navItems = computed(() => [
  { label: t("nav.home"), to: "/", icon: "lucide:house", active: route.path === "/" },
  {
    label: t("nav.videos"),
    to: "/videos",
    icon: "lucide:clapperboard",
    active: route.path.startsWith("/videos") && !is_favorites_feed.value,
  },
  {
    label: t("nav.favorites"),
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
    class="liquid-glass liquid-glass-dense fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-50 grid h-16 grid-cols-4 rounded-full px-1 lg:hidden"
    :aria-label="t('nav.label')"
  >
    <NuxtLink
      v-for="item in navItems"
      :key="item.icon"
      :to="item.to"
      :aria-current="item.active ? 'page' : undefined"
      class="flex flex-col items-center justify-center gap-0.5 transition-colors"
      :class="item.active ? 'text-alt' : 'text-ui-text-muted'"
    >
      <Icon :name="item.icon" class="text-xl" />
      <span class="text-[11px] font-semibold">{{ item.label }}</span>
    </NuxtLink>

    <button
      class="flex flex-col items-center justify-center gap-0.5 transition-colors"
      :class="route.path.startsWith('/subscriptions') ? 'text-alt' : 'text-ui-text-muted'"
      @click="open_subscriptions"
    >
      <Icon name="lucide:users" class="text-xl" />
      <span class="text-[11px] font-semibold">{{ t("nav.subscriptions") }}</span>
    </button>
  </nav>
</template>
