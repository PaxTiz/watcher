<script lang="ts" setup>
const { t } = useI18n();
const { appUrl } = useRuntimeConfig().public;
const localePath = useLocalePath();
const route = useRoute();

const SECTIONS = ["home", "why", "features", "fusion", "roadmap", "faq"] as const;

const home = computed(() => localePath("index"));
const active = ref<(typeof SECTIONS)[number] | null>(null);

const update_active = () => {
  if (!document.getElementById("home")) {
    active.value = null;
    return;
  }
  let current: (typeof SECTIONS)[number] = "home";
  for (const id of SECTIONS) {
    const element = document.getElementById(id);
    if (element && element.getBoundingClientRect().top < 140) {
      current = id;
    }
  }
  active.value = current;
};

onMounted(update_active);
watch(
  () => route.path,
  () => nextTick(update_active),
);
useEventListener("scroll", update_active, { passive: true });
</script>

<template>
  <header
    class="dark bg-frame sticky top-0 z-50 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 lg:grid-cols-[1fr_auto_1fr]"
  >
    <WatcherLogo class="h-7" :to="home" />

    <nav
      :aria-label="t('nav.label')"
      class="flex max-w-full items-center gap-0.5 justify-self-center overflow-x-auto rounded-full border border-[var(--navbar-border)] bg-[var(--navbar-bg)] p-1 backdrop-blur-md"
    >
      <a
        v-for="id in SECTIONS"
        :key="id"
        :href="`${home}#${id}`"
        class="flex h-8 items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors"
        :class="
          active === id ? 'bg-ui-text text-background' : 'text-ui-text-muted hover:text-ui-text'
        "
        :aria-current="active === id ? 'location' : undefined"
        @click="active = id"
      >
        {{ t(`nav.${id}`) }}
      </a>
    </nav>

    <div class="flex items-center gap-1 justify-self-end">
      <div class="hidden items-center sm:flex">
        <WatcherLanguageToggle />
        <WatcherThemeToggle />
      </div>
      <a
        :href="`${appUrl}/auth/login`"
        class="text-ui-text hover:bg-ui-text/[0.07] hidden h-[38px] items-center rounded-xl px-3.5 text-sm font-medium whitespace-nowrap min-[980px]:flex"
      >
        {{ t("nav.login") }}
      </a>
      <a
        :href="`${home}#join`"
        class="bg-alt flex h-[38px] items-center rounded-xl px-4 text-sm font-semibold whitespace-nowrap text-[#121521] transition-colors hover:bg-[#ff7a26]"
      >
        {{ t("nav.join") }}
      </a>
    </div>
  </header>
</template>
