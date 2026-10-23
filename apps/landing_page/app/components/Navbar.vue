<script lang="ts" setup>
const { t } = useI18n();

const links = computed(() => [
  { to: "#feed", label: t("nav.feed") },
  { to: "#player", label: t("nav.player") },
  { to: "#how", label: t("nav.how") },
  { to: "#questions", label: t("nav.faq") },
]);
</script>

<template>
  <header class="sticky top-0 z-20 bg-[var(--background)]/80 backdrop-blur-md">
    <div class="container flex h-16 items-center gap-6">
      <WatcherLogo
        class="[&_span]:font-display [&_div]:size-[26px] [&_div]:text-[15px] [&_span]:text-[15px] [&_span]:font-medium"
      />

      <nav class="text-ui-text-muted ml-6 hidden gap-5.5 text-sm md:flex" aria-label="Sections">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="hover:text-ui-text transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-1">
        <WatcherLanguageToggle />
        <WatcherThemeToggle />
        <NuxtLink
          to="#start"
          class="text-ui-text hover:text-alt mx-3 hidden text-sm transition-colors sm:inline"
        >
          {{ t("nav.login") }}
        </NuxtLink>
        <WatcherButton :label="t('nav.start')" to="#start" color="solid" />
      </div>
    </div>
  </header>
</template>
