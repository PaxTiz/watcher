<template>
  <section class="bg-gray-100 py-16">
    <div class="container">
      <h2 class="text-center text-4xl font-black">Questions fréquentes</h2>

      <WatcherAccordion
        :items="[
          {
            label: 'L\'app est-elle gratuite ?',
            value: 'is_app_free',
            content:
              'Oui, Watcher est gratuit pour commencer. Une offre premium sans publicité et avec des filtres avancés arrivera plus tard.',
          },
          {
            label: 'Comment fonctionne la synchronisation ?',
            value: 'how_sync_works',
            content:
              'Tu connectes tes comptes Twitch et YouTube en quelques clics, Watcher récupère automatiquement tes abonnements et les met à jour en continu.',
          },
          {
            label: 'Mes identifiants sont-ils en sécurité ?',
            value: 'are_credentials_safe',
            content:
              'Watcher utilise uniquement les connexions officielles Twitch et YouTube (OAuth) — nous ne stockons jamais ton mot de passe.',
          },
          {
            label: 'Quand aurai-je accès à la bêta ?',
            value: 'plateform_access',
            content:
              'Les invitations sont envoyées par vagues chaque semaine. Plus tôt tu t\'inscris, plus tôt tu reçois ton accès.',
          },
        ]"
        class="mt-8"
      />
    </div>
  </section>
</template>
