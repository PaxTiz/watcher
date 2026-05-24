<script lang="ts" setup>
import { LazyLoginModal } from "#components";

definePageMeta({ layout: "auth" });

const { loggedIn } = useUserSession();
if (loggedIn.value) {
  await navigateTo("/");
}

const overlay = useOverlay();

const onShowBlueskyModal = () => {
  overlay.create(LazyLoginModal).open();
};
</script>

<template>
  <div class="relative">
    <section class="mt-32">
      <Logo />

      <h1 class="text-ui-text mt-4 text-4xl font-bold">Connexion</h1>
      <p class="text-ui-text-muted mt-1">Veuillez vous connecter afin d'accéder à Watcher.</p>

      <Card class="mt-4 space-y-2">
        <Button
          label="Connexion avec BlueSky"
          icon="fa7-brands:bluesky"
          size="lg"
          class="w-full"
          @click="onShowBlueskyModal"
        />

        <Button
          to="/api/oauth/google"
          label="Connexion avec Google"
          icon="fa7-brands:youtube"
          size="lg"
          class="w-full"
          external
        />

        <Button
          to="/api/oauth/twitch"
          label="Connexion avec Twitch"
          icon="fa7-brands:twitch"
          size="lg"
          class="w-full"
          external
        />
      </Card>
    </section>
  </div>
</template>
