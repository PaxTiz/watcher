<template>
  <section class="bg-background pt-16">
    <div class="container">
      <div class="bg-alt rounded p-8 sm:p-16">
        <h2 class="section-title__white text-left md:text-center">
          Rejoins la bêta et simplifie ton suivi dès aujourd'hui
        </h2>
        <p class="mt-4 text-left text-gray-200 md:text-center">
          Connecte un compte, teste Watcher gratuitement, sans engagement.
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-start gap-4 md:justify-center">
          <WatcherButton label="Continuer avec Twitch" color="white" size="lg" class="font-bold" />
          <WatcherButton label="Continuer avec YouTube" color="glass" size="lg" class="font-bold" />
        </div>
      </div>
    </div>

    <div class="bg-ui-bg mt-16 py-8">
      <div class="container">
        <div
          class="flex flex-col items-start justify-between gap-4 text-left sm:flex-row sm:items-center"
        >
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
