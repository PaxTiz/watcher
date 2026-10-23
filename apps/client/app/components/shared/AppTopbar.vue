<script lang="ts" setup>
import { LazySubscriptionsSidebarSlideover } from "#components";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const overlay = useWatcherOverlay();

const { items } = usePageNavigation();

const crumb_pill = useTemplateRef("crumb_pill");
useLiquidGlass(crumb_pill);

const can_go_back = computed(() => (route.name as string) !== pages.home);

const go_back = async () => {
  if (import.meta.client && window.history.state?.back) {
    return router.back();
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
      :aria-label="t('nav.open_menu')"
      @click="open_menu"
    >
      <Icon name="lucide:menu" class="text-lg" />
    </button>

    <button
      v-if="can_go_back"
      type="button"
      class="liquid-glass text-ui-text pointer-events-auto hidden size-10 shrink-0 items-center justify-center rounded-full lg:flex"
      :aria-label="t('nav.back')"
      @click="go_back"
    >
      <Icon name="lucide:chevron-left" class="text-lg" />
    </button>

    <nav
      v-if="items"
      ref="crumb_pill"
      :aria-label="t('nav.breadcrumb')"
      class="liquid-glass text-ui-text pointer-events-auto flex h-10 min-w-0 items-center rounded-full px-4 text-sm"
    >
      <ul class="flex items-center gap-2">
        <li
          v-for="(item, index) in [
            { label: t('nav.home'), icon: 'lucide:house', to: '/' },
            ...items,
          ]"
          :key="item.label"
          class="group inline-flex items-center gap-1"
        >
          <!-- <Icon v-if="item.icon" :name="item.icon" class="text-ui-text shrink-0" /> -->
          <NuxtLink v-if="item.to" :to="item.to" class="shrink-0 transition-colors">
            {{ item.label }}
          </NuxtLink>
          <span v-else class="text-ui-text shrink-0 font-medium">{{ item.label }}</span>

          <Icon
            v-if="index < items.length"
            name="lucide:chevron-right"
            class="text-ui-text shrink-0 text-xs"
          />
        </li>
      </ul>
    </nav>
  </div>
</template>
