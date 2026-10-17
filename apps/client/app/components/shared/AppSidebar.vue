<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

const route = useRoute();

const is_favorites_feed = computed(
  () => route.path === "/videos" && route.query.is_favorite === "true",
);

const nav_items = computed<
  Array<{ label: string; to: RouteLocationRaw; icon: string; active: boolean }>
>(() => [
  { label: "Accueil", to: "/", icon: "lucide:house", active: route.path === "/" },
  {
    label: "Vidéos",
    to: "/videos",
    icon: "lucide:clapperboard",
    active: route.path === "/videos" && !is_favorites_feed.value,
  },
  {
    label: "Favoris",
    to: { path: "/videos", query: { is_favorite: "true" } },
    icon: "lucide:star",
    active: is_favorites_feed.value,
  },
]);
</script>

<template>
  <aside class="flex flex-col">
    <div class="px-6 pt-6 pb-3">
      <WatcherLogo class="[&_span]:font-display [&_span]:text-base" />
    </div>

    <nav class="space-y-0.5 p-3" aria-label="Navigation principale">
      <NuxtLink
        v-for="item in nav_items"
        :key="item.label"
        :to="item.to"
        :aria-current="item.active ? 'page' : undefined"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-[0.95rem] transition-colors"
        :class="
          item.active
            ? 'text-ui-text [&_svg]:text-alt bg-ui-border/70 font-semibold dark:bg-[rgb(var(--tint)/0.16)]'
            : 'text-ui-text-muted hover:bg-ui-border/40 hover:text-ui-text'
        "
      >
        <Icon :name="item.icon" class="text-lg" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div class="mx-6 border-t border-[var(--navbar-border)]" />

    <SubscriptionsSidebar class="min-h-0 flex-1" />
  </aside>
</template>
