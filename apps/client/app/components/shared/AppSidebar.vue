<script lang="ts" setup>
import type { SubscriptionResource } from "@watcher/common";
import { differenceInHours } from "date-fns";
import type { RouteLocationRaw } from "vue-router";

import { ContentSearch } from "#components";
import { mockSearch } from "~/utils/search";

const { collapsed = false } = defineProps<{ collapsed?: boolean }>();
const emit = defineEmits<{ toggle: [] }>();

const { t } = useI18n();
const route = useRoute();
const { search, go_to_results, clear_search } = useGlobalSearch();
const { favorites, others } = useSubscriptions();

const is_favorites_feed = computed(
  () => route.path === "/videos" && route.query.is_favorite === "true",
);

const nav_items = computed<
  Array<{ label: string; to: RouteLocationRaw; icon: string; active: boolean }>
>(() => [
  { label: t("nav.home"), to: "/", icon: "lucide:house", active: route.path === "/" },
  {
    label: t("nav.videos"),
    to: "/videos",
    icon: "lucide:clapperboard",
    active: route.path === "/videos" && !is_favorites_feed.value,
  },
  {
    label: t("nav.favorites"),
    to: { path: "/videos", query: { is_favorite: "true" } },
    icon: "lucide:star",
    active: is_favorites_feed.value,
  },
]);

const rail_subscriptions = computed(() =>
  [...favorites.value, ...others.value.filter((s) => !s.is_hidden)].slice(0, 12),
);

const has_new_video = (sub: SubscriptionResource) => {
  return !!sub.last_video_at && differenceInHours(new Date(), sub.last_video_at) < 24;
};

const on_search = () => {
  const overlay = useWatcherOverlay();
  overlay.create(ContentSearch).open({ searchFn: mockSearch });
};
</script>

<template>
  <aside
    class="text-ui-text flex flex-col transition-[width] duration-300 ease-out motion-reduce:transition-none"
    :class="collapsed ? 'w-[68px]' : 'w-64'"
  >
    <div
      class="flex h-14 shrink-0 items-center gap-2 px-3.5"
      :class="{ 'justify-center px-0': collapsed }"
    >
      <WatcherLogo
        v-if="!collapsed"
        class="[&_span]:font-display ml-1 [&_span]:text-[15px] [&_span]:font-medium"
      />
      <button
        type="button"
        class="text-ui-text-muted hover:bg-ui-text/10 hover:text-ui-text flex size-9 items-center justify-center rounded-lg transition-colors"
        :class="{ 'ml-auto': !collapsed }"
        :aria-label="t(collapsed ? 'nav.expand_sidebar' : 'nav.collapse_sidebar')"
        :title="t(collapsed ? 'nav.expand' : 'nav.collapse')"
        @click="emit('toggle')"
      >
        <Icon
          :name="collapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
          class="text-lg"
        />
      </button>
    </div>

    <div class="shrink-0 px-3 pb-2">
      <button
        v-if="collapsed"
        type="button"
        class="text-ui-text-muted hover:bg-ui-text/10 hover:text-ui-text mx-auto flex size-10 items-center justify-center rounded-lg transition-colors"
        :aria-label="t('common.search')"
        :title="t('common.search')"
        @click="on_search"
      >
        <Icon name="lucide:search" class="text-lg" />
      </button>

      <div v-else class="group relative flex items-center">
        <span class="sr-only">{{ t("common.search") }}</span>
        <Icon name="lucide:search" class="text-ui-text-muted pointer-events-none absolute left-3" />
        <button
          ref="search_input"
          class="control-field text-ui-text-muted !h-9 w-full cursor-pointer pl-9 text-left"
          @click="on_search"
        >
          {{ t("common.search") }}
        </button>
      </div>
    </div>

    <nav class="shrink-0 space-y-0.5 px-3" :aria-label="t('nav.label')">
      <NuxtLink
        v-for="item in nav_items"
        :key="item.icon"
        :to="item.to"
        :aria-current="item.active ? 'page' : undefined"
        :title="collapsed ? item.label : undefined"
        class="flex items-center gap-3 rounded-lg py-2 text-sm transition-colors"
        :class="[
          collapsed ? 'mx-auto size-10 justify-center px-0' : 'px-3',
          item.active
            ? 'text-ui-text [&_svg]:text-alt bg-ui-text/10 font-medium'
            : 'text-ui-text-muted hover:text-ui-text hover:bg-ui-text/[0.06]',
        ]"
      >
        <Icon :name="item.icon" class="shrink-0 text-lg" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="border-ui-text/10 mx-5 my-3 shrink-0 border-t" />

    <SubscriptionsSidebar v-if="!collapsed" class="min-h-0 flex-1" />

    <ul v-else class="min-h-0 flex-1 [scrollbar-width:none] space-y-1.5 overflow-y-auto px-3">
      <li v-for="sub in rail_subscriptions" :key="sub.id">
        <NuxtLink
          :to="`/subscriptions/${sub.slug}`"
          :title="sub.name"
          class="hover:bg-ui-text/10 relative mx-auto block size-10 rounded-full p-1 transition-colors"
          :class="{ 'bg-ui-text/10': route.path === `/subscriptions/${sub.slug}` }"
        >
          <NuxtImg
            class="size-8 rounded-full object-cover"
            loading="lazy"
            format="avif,webp"
            width="32"
            height="32"
            :src="sub.channel.logo"
            :alt="sub.name"
          />
          <span
            v-if="has_new_video(sub)"
            class="bg-alt absolute top-0.5 right-0.5 size-2.5 rounded-full ring-2 ring-[var(--frame)]"
          />
        </NuxtLink>
      </li>
    </ul>

    <div class="border-ui-text/10 shrink-0 space-y-0.5 border-t p-3">
      <UserDropdown :compact="collapsed" />
    </div>
  </aside>
</template>
