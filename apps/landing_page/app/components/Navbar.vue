<script lang="ts" setup>
//
</script>

<template>
  <div class="fixed top-4 right-0 left-0 container">
    <nav
      class="navbar flex items-center justify-between rounded border border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm"
    >
      <div>
        <WatcherLogo />
      </div>

      <div>
        <ul class="text-landing-text flex items-center gap-4 font-semibold">
          <li>
            <nuxt-link to="#">Fonctionnalités</nuxt-link>
          </li>
          <li>
            <nuxt-link to="#">Aperçu</nuxt-link>
          </li>
          <li>
            <nuxt-link to="#">FAQ</nuxt-link>
          </li>
        </ul>
      </div>

      <div>
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
