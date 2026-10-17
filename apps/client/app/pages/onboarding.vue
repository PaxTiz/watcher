<script lang="ts" setup>
definePageMeta({ layout: "auth" });

useMeta({
  title: "Bienvenue",
  description: "Configurez vos accès et synchronisez vos abonnements en toute simplicité",
});
</script>

<template>
  <section>
    <WatcherLogo class="[&_span]:font-display [&_span]:text-[15px] [&_span]:font-medium" />

    <h1 class="page-title mt-10 md:text-3xl">Bienvenue sur Watcher</h1>
    <p class="text-ui-text-muted mt-3">
      Associez vos comptes puis lancez une première synchronisation pour récupérer vos chaînes et
      leurs dernières vidéos.
    </p>

    <div class="mt-8 space-y-8">
      <OnboardingServicesLogin />
      <OnboardingSynchronization />
    </div>
  </section>
</template>
