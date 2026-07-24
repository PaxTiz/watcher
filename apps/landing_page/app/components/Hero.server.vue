<template>
  <section class="bg-background pt-28 pb-8 sm:pt-36">
    <div class="container flex flex-col gap-4">
      <h1 class="page-title text-left md:text-center">
        Retrouve tous tes <span class="text-alt">créateurs préférés</span> réunis dans un seul
        <span class="text-alt">flux unifié</span>
      </h1>

      <p class="section-description text-left md:text-center">
        Watcher réunit tes abonnements Twitch et YouTube dans une interface unique. Plus besoin de
        jongler entre les plateformes pour ne rien rater.
      </p>

      <div class="mt-4 flex flex-wrap items-center justify-start gap-4 md:justify-center">
        <WatcherButton label="Commencer" color="secondary" size="lg" class="font-bold" />
        <WatcherButton label="Voir la démo" size="lg" class="font-bold" />
      </div>

      <HeroVideo class="mt-8" />
    </div>
  </section>
</template>
