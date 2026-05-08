<script lang="ts" setup>
definePageMeta({ layout: "auth" });

const { loggedIn } = useUserSession();
if (loggedIn.value) {
  await navigateTo("/");
}

const showBlueskyModal = ref(false);

const onShowBlueskyModal = () => {
  showBlueskyModal.value = !showBlueskyModal.value;
};
</script>

<template>
  <!-- <LoginForm class="mt-32" /> -->

  <div class="relative">
    <LoginModal v-model="showBlueskyModal" />

    <section class="mt-32">
      <Logo />

      <h1 class="mt-4 text-4xl font-bold text-white">Connexion</h1>
      <p class="mt-1 text-gray-300">Veuillez vous connecter afin d'accéder à Watcher.</p>

      <Card class="mt-4 space-y-2">
        <Button
          label="Connexion avec BlueSky"
          icon="fa7-brands:bluesky"
          size="lg"
          class="w-full"
          @click="onShowBlueskyModal"
        />

        <!-- <Button label="Connexion avec Google" icon="fa7-brands:youtube" size="lg" class="w-full" />

        <Button label="Connexion avec Twitch" icon="fa7-brands:twitch" size="lg" class="w-full" /> -->
      </Card>
    </section>
  </div>
</template>
