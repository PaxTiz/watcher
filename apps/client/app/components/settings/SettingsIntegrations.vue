<script lang="ts" setup>
const providers = [
  {
    id: "google",
    name: "Google",
    icon: "fa7-brands:youtube",
    color: "text-red-500",
    linkUrl: "/api/oauth/google?integration=true",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: "fa7-brands:twitch",
    color: "text-purple-500",
    linkUrl: "/api/oauth/twitch?integration=true",
  },
  {
    id: "bluesky",
    name: "BlueSky",
    icon: "fa7-brands:bluesky",
    color: "text-blue-500",
    linkUrl: "/api/oauth/bluesky?integration=true",
  },
] as const;
</script>

<template>
  <section>
    <h2 class="text-ui-text text-2xl font-semibold">Comptes liés</h2>
    <p class="text-ui-text-muted">Liez vos comptes sociaux pour synchroniser vos abonnements.</p>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SettingsIntegrationCard
        v-for="provider in providers"
        :key="provider.id"
        :integration="provider"
      />
    </div>
  </section>
</template>
