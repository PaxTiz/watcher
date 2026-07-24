<script lang="ts" setup>
//
</script>

<template>
  <div class="fixed top-4 right-4 left-4 z-10">
    <nav
      class="navbar flex items-center justify-between rounded border border-[var(--navbar-border)] bg-[var(--navbar-bg)] px-4 py-3 backdrop-blur-sm"
    >
      <div>
        <WatcherLogo />
      </div>

      <div>
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
        <WatcherButton label="Connexion" color="secondary" class="font-bold" />
      </div>
    </nav>
  </div>
</template>

<style scoped>
.navbar {
  box-shadow: rgba(0, 0, 0, 0.25) 0px 10px 30px -14px;
}
</style>
