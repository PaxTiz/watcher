<script lang="ts" setup>
import { toast } from "vue-sonner";

const { user, fetch, clear } = useUserSession();

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

const is_linked = (provider_id: (typeof providers)[number]["id"]) => {
  return !!user.value?.integrations?.[provider_id as keyof typeof user.value.integrations];
};

const on_disconnect = async (provider_id: (typeof providers)[number]["id"]) => {
  const { error } = await useAppFetch(`/api/integrations/${provider_id}/disconnect`, {
    method: "DELETE",
  });

  if (error.value) {
    toast.error(`Une erreur est survenue lors de la déconnexion de ${provider_id}`);
  } else {
    const provider = providers.find((e) => e.id === provider_id)!.name;

    await fetch();
    toast.success(`Le compte ${provider} a été déconnecté`);
  }
};
</script>

<template>
  <section>
    <h2 class="text-2xl font-semibold text-white">Comptes liés</h2>
    <p class="text-gray-400">Liez vos comptes sociaux pour synchroniser vos abonnements.</p>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="provider in providers" :key="provider.id" class="flex flex-col justify-between">
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
            <p v-if="is_linked(provider.id)" class="text-xs text-green-400">Connecté</p>
            <p v-else class="text-xs text-gray-500">Non connecté</p>
          </div>
        </div>

        <div class="mt-6">
          <template v-if="!is_linked(provider.id)">
            <Button
              :to="provider.linkUrl"
              :label="`Lier mon compte ${provider.name}`"
              size="sm"
              class="w-full"
              external
            />
          </template>
          <template v-else>
            <div class="text-ui-text mb-4 text-sm">
              ID:
              <span class="font-mono text-xs opacity-50">
                {{ user?.integrations?.[provider.id as keyof typeof user.integrations] }}
              </span>
            </div>
            <Button
              label="Déconnecter"
              size="sm"
              class="w-full"
              @click="on_disconnect(provider.id)"
            />
          </template>
        </div>
      </Card>
    </div>
  </section>
</template>
