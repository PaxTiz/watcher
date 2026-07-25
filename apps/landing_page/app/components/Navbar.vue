<script lang="ts" setup>
const { t } = useI18n();

const isMobileMenuOpen = ref(false);

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}
</script>

<template>
  <div class="fixed top-4 right-4 left-4 z-10">
    <nav
      class="navbar border-ui-border flex items-center justify-between rounded border bg-white/50 px-4 py-3 backdrop-blur-md dark:bg-[var(--navbar-bg)]/50"
    >
      <div>
        <WatcherLogo />
      </div>

      <div class="hidden md:block">
        <ul
          class="text-landing-text [&>li:hover>a]:text-ui-text flex items-center gap-8 text-[15px] font-semibold"
        >
          <li>
            <nuxt-link to="#features">{{ t("nav.features") }}</nuxt-link>
          </li>
          <li>
            <nuxt-link to="#overview">{{ t("nav.overview") }}</nuxt-link>
          </li>
          <li>
            <nuxt-link to="#questions">{{ t("nav.faq") }}</nuxt-link>
          </li>
        </ul>
      </div>

      <div class="flex items-center">
        <LanguageToggle />

        <ThemeToggle />

        <div class="ml-2 hidden md:block">
          <WatcherButton :label="t('nav.login')" color="secondary" class="font-bold" />
        </div>

        <button
          type="button"
          class="text-landing-text flex items-center justify-center md:hidden"
          :aria-label="t('nav.openMenu')"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <Icon :name="isMobileMenuOpen ? 'lucide:x' : 'lucide:menu'" class="text-2xl" />
        </button>
      </div>
    </nav>

    <div
      v-if="isMobileMenuOpen"
      class="navbar mt-2 flex flex-col gap-4 rounded border border-[var(--navbar-border)] bg-[var(--navbar-bg)] p-4 backdrop-blur-sm md:hidden"
    >
      <ul class="text-landing-text flex flex-col gap-3 text-[15px] font-semibold">
        <li>
          <nuxt-link to="#features" @click="closeMobileMenu">{{ t("nav.features") }}</nuxt-link>
        </li>
        <li>
          <nuxt-link to="#overview" @click="closeMobileMenu">{{ t("nav.overview") }}</nuxt-link>
        </li>
        <li>
          <nuxt-link to="#questions" @click="closeMobileMenu">{{ t("nav.faq") }}</nuxt-link>
        </li>
      </ul>

      <WatcherButton :label="t('nav.login')" color="secondary" class="w-full font-bold" />
    </div>
  </div>
</template>

<style scoped>
.navbar {
  box-shadow: rgba(0, 0, 0, 0.25) 0px 10px 30px -14px;
}
</style>
