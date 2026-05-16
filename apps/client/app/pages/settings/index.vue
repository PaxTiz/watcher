<script lang="ts" setup>
const { user } = useUserSession();

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

const isLinked = (providerId: (typeof providers)[number]["id"]) => {
  return !!user.value?.integrations?.[providerId as keyof typeof user.value.integrations];
};
</script>

<template>
  <pre class="text-white"><code>{{ user }}</code></pre>

  <div class="mx-auto max-w-4xl">
    <h1 class="text-4xl font-bold text-white">Paramètres</h1>
    <p class="mt-2 text-gray-400">Gérez vos intégrations et les paramètres de votre compte.</p>

    <div class="mt-12 space-y-8">
      <section>
        <h2 class="text-2xl font-semibold text-white">Comptes liés</h2>
        <p class="text-gray-400">Liez vos comptes sociaux pour synchroniser vos abonnements.</p>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="provider in providers"
            :key="provider.id"
            class="flex flex-col justify-between"
          >
            <div class="flex items-center gap-4">
              <div
                :class="[
                  provider.color,
                  'bg-ui-bg border-ui-border flex h-12 w-12 items-center justify-center rounded-full border',
                ]"
              >
                <Icon :name="provider.icon" class="text-2xl" />
              </div>
              <div>
                <h3 class="font-medium text-white">{{ provider.name }}</h3>
                <p v-if="isLinked(provider.id)" class="text-xs text-green-400">Connecté</p>
                <p v-else class="text-xs text-gray-500">Non connecté</p>
              </div>
            </div>

            <div class="mt-6">
              <Button
                v-if="!isLinked(provider.id)"
                :to="provider.linkUrl"
                :label="`Lier mon compte ${provider.name}`"
                size="sm"
                class="w-full"
                external
              />
              <div v-else class="text-ui-text text-sm">
                ID:
                <span class="font-mono text-xs opacity-50">{{
                  user?.integrations?.[provider.id as keyof typeof user.integrations]
                }}</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section class="border-ui-border border-t pt-8">
        <h2 class="text-2xl font-semibold text-white">Profil</h2>
        <Card class="mt-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400">Nom d'affichage</label>
              <p class="mt-1 text-white">{{ user?.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400">Identifiant interne</label>
              <p class="mt-1 font-mono text-xs text-gray-500">{{ user?.id }}</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  </div>
</template>
