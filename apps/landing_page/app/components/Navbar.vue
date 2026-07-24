<script lang="ts" setup>
const isMobileMenuOpen = ref(false);

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}
</script>

<template>
  <div class="fixed top-4 right-4 left-4 z-10">
    <nav
      class="navbar flex items-center justify-between rounded border border-[var(--navbar-border)] bg-[var(--navbar-bg)] px-4 py-3 backdrop-blur-sm"
    >
      <div>
        <WatcherLogo />
      </div>

      <div class="hidden md:block">
        <ul
          class="text-landing-text [&>li:hover>a]:text-ui-text flex items-center gap-8 text-[15px] font-semibold"
        >
          <li>
            <nuxt-link to="#features">Fonctionnalités</nuxt-link>
          </li>
          <li>
            <nuxt-link to="#overview">Aperçu</nuxt-link>
          </li>
          <li>
            <nuxt-link to="#questions">FAQ</nuxt-link>
          </li>
        </ul>
      </div>

      <div class="flex items-center gap-2">
        <ThemeToggle />

        <div class="hidden md:block">
          <WatcherButton label="Connexion" color="secondary" class="font-bold" />
        </div>

        <button
          type="button"
          class="text-landing-text flex items-center justify-center md:hidden"
          aria-label="Ouvrir le menu"
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
          <nuxt-link to="#features" @click="closeMobileMenu">Fonctionnalités</nuxt-link>
        </li>
        <li>
          <nuxt-link to="#overview" @click="closeMobileMenu">Aperçu</nuxt-link>
        </li>
        <li>
          <nuxt-link to="#questions" @click="closeMobileMenu">FAQ</nuxt-link>
        </li>
      </ul>

      <WatcherButton label="Connexion" color="secondary" class="w-full font-bold" />
    </div>
  </div>
</template>

<style scoped>
.navbar {
  box-shadow: rgba(0, 0, 0, 0.25) 0px 10px 30px -14px;
}
</style>
