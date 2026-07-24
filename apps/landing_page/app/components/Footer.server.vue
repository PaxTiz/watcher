<template>
  <section class="bg-gray-100 pt-16">
    <div class="container">
      <div class="bg-alt rounded p-16">
        <h2 class="text-center text-4xl font-black text-gray-200">
          Rejoins la bêta et simplifie ton suivi dès aujourd'hui
        </h2>
        <p class="mt-4 text-center text-gray-200">
          Connecte un compte, teste Watcher gratuitement, sans engagement.
        </p>

        <div class="mt-8 flex items-center justify-center gap-4">
          <WatcherButton label="Continuer avec Twitch" color="white" size="lg" class="font-bold" />
          <WatcherButton label="Continuer avec YouTube" color="glass" size="lg" class="font-bold" />
        </div>
      </div>
    </div>

    <div class="mt-16 bg-white py-8">
      <div class="container">
        <div class="flex items-center justify-between gap-4">
          <div>
            <WatcherLogo />
          </div>

          <div class="text-landing-text text-sm">
            <span>© 2026 Watcher. Non affilié à Twitch Interactive ou YouTube LLC. </span>
          </div>

          <div class="text-landing-text inline-flex gap-4 text-sm">
            <nuxt-link>Confidentialité</nuxt-link>
            <nuxt-link>Conditions</nuxt-link>
            <nuxt-link>Contact</nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
