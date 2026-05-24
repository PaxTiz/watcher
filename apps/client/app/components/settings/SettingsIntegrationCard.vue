<script lang="ts" setup>
import { toast } from "vue-sonner";

import { LazyLoginModal } from "#components";

const { user, fetch } = useUserSession();

const { integration } = defineProps<{
  integration: {
    id: "google" | "twitch" | "bluesky";
    name: string;
    icon: string;
    color: string;
    linkUrl: string;
  };
}>();

const is_linked = computed(() => !!user.value?.integrations?.[integration.id]);

const { error: disconnect_error, execute: on_execute_disconnect } = usePost(
  `/api/integrations/${integration.id}/disconnect`,
  {
    method: "DELETE",
  },
  { immediate: false },
);

const on_disconnect = async () => {
  const ok = await useConfirm({
    title: `Déconnexion de votre compte ${integration.name}`,
    description:
      "Si vous déconnectez votre compte, vos abonnements ainsi que les vidéos liées à vos abonnements ne seront plus mis à jour.",
  });

  if (!ok) {
    return;
  }

  await on_execute_disconnect();
  if (disconnect_error.value) {
    toast.error(`Une erreur est survenue lors de la déconnexion de ${integration.name}`);
  } else {
    await fetch();
    toast.success(`Le compte ${integration.name} a été déconnecté`);
  }
};

const on_link = () => {
  if (integration.id !== "bluesky") {
    window.open(integration.linkUrl, "_self");
  } else {
    useOverlay().create(LazyLoginModal).open({
      title: "Lier mon compte BlueSky",
      description: "Saisissez votre identifiant BlueSky pour vous connecter et lier votre compte.",
      button: "Lier mon compte",
      link: true,
    });
  }
};
</script>

<template>
  <Card class="flex flex-col justify-between">
    <div class="flex items-center gap-4">
      <div
        :class="[
          integration.color,
          'bg-ui-bg border-ui-border flex h-12 w-12 items-center justify-center rounded-full border',
        ]"
      >
        <Icon :name="integration.icon" class="text-2xl" />
      </div>
      <div>
        <h3 class="text-ui-text font-medium">{{ integration.name }}</h3>
        <p v-if="is_linked" class="text-xs text-green-400">Connecté</p>
        <p v-else class="text-ui-text-muted text-xs">Non connecté</p>
      </div>
    </div>

    <div class="mt-6">
      <template v-if="!is_linked">
        <Button
          :label="`Lier mon compte ${integration.name}`"
          size="sm"
          class="w-full"
          external
          @click="on_link"
        />
      </template>
      <template v-else>
        <div class="text-ui-text mb-4 text-sm">
          ID:
          <span class="font-mono text-xs opacity-50">
            {{ user?.integrations?.[integration.id] }}
          </span>
        </div>
        <Button label="Déconnecter" size="sm" class="w-full" @click="on_disconnect" />
      </template>
    </div>
  </Card>
</template>
