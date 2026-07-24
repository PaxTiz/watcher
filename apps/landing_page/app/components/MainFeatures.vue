<template>
  <section class="bg-background">
    <div class="container py-16">
      <h2 class="section-title mt-4 mb-1">Fait pour suivre, pas pour chercher</h2>
      <p class="section-description">
        Quatre idées simple pensées pour te faire gagner du temps chaque jour.
      </p>

      <div class="mt-8">
        <div class="grid grid-cols-[1fr_2fr] gap-4">
          <div class="border-ui-border bg-ui-bg rounded border p-8">
            <div class="bg-alt flex h-12 w-12 items-center justify-center rounded">
              <Icon name="lucide:clapperboard" class="text-2xl text-white" />
            </div>

            <h3 class="sub-section-title mt-4 mb-1">Flux unifié</h3>
            <p class="text-landing-text">
              Vidéos, lives et VOD de Twitch et YouTube rassemblés dans une seule timeline, triée
              par récence.
            </p>
          </div>

          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="border-ui-border bg-ui-bg rounded border p-8">
                <div
                  class="dark:bg-ui-border flex h-12 w-12 items-center justify-center rounded bg-black"
                >
                  <Icon name="lucide:leaf" class="text-2xl text-white" />
                </div>

                <h3 class="sub-section-title mt-4 mb-1">Interface simple</h3>
                <p class="text-landing-text">
                  Aucune surcharge, aucun réglage compliqué. Tu ouvres l'app, tu vois ce qui est
                  nouveau.
                </p>
              </div>

              <div class="border-ui-border bg-ui-bg rounded border p-8">
                <div
                  class="dark:bg-ui-border flex h-12 w-12 items-center justify-center rounded bg-black"
                >
                  <Icon name="lucide:play" class="bg-white text-2xl text-white" />
                </div>

                <h3 class="sub-section-title mt-4 mb-1">Lecteur intégré</h3>
                <p class="text-landing-text">
                  Regarde directement dans Watcher, sans changer d'onglet.
                </p>
              </div>
            </div>

            <div class="border-ui-border bg-alt flex items-center gap-4 rounded border p-8">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white/30">
                <Icon name="lucide:move-right" class="bg-white text-2xl text-white" />
              </div>

              <div>
                <h3 class="sub-section-title__white">Regroupement de chaînes</h3>
                <p class="mt-2 text-white">
                  Fusionne les chaînes Twitch et YouTube d'un même créateur — voir plus bas ↓
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
