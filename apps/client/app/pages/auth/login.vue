<script lang="ts" setup>
import { LazyLoginModal } from "#components";

definePageMeta({ layout: "auth" });

const { loggedIn } = useUserSession();
if (loggedIn.value) {
  await navigateTo("/");
}

const overlay = useWatcherOverlay();

const onShowBlueskyModal = () => {
  overlay.create(LazyLoginModal).open();
};

useMeta({ title: "Connexion" });
</script>

<template>
  <div class="relative">
    <section class="mt-12 md:mt-32">
      <WatcherLogo />

      <h1 class="text-ui-text mt-4 text-2xl font-bold md:text-4xl">Connexion</h1>
      <p class="text-ui-text-muted mt-1">Veuillez vous connecter afin d'accéder à Watcher.</p>

      <WatcherCard class="mt-4 space-y-2">
        <WatcherButton
          label="Connexion avec Bluesky"
          icon="fa7-brands:bluesky"
          size="lg"
          class="w-full"
          @click="onShowBlueskyModal"
        />

        <WatcherButton
          to="/api/oauth/google"
          label="Connexion avec Google"
          icon="fa7-brands:youtube"
          size="lg"
          class="w-full"
          external
        />

        <WatcherButton
          to="/api/oauth/twitch"
          label="Connexion avec Twitch"
          icon="fa7-brands:twitch"
          size="lg"
          class="w-full"
          external
        />
      </WatcherCard>
    </section>
  </div>
</template>
