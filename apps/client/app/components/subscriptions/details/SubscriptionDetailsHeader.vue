<script lang="ts" setup>
import { toast } from "vue-sonner";

import type { SubscriptionResource } from "#shared/resources/subscriptions";
import { type VideoCurrentRefreshType, VIDEO_CURRENT_REFRESH_SYMBOL } from "#shared/types/videos";

const refresh = inject<VideoCurrentRefreshType>(VIDEO_CURRENT_REFRESH_SYMBOL);

const { subscription } = defineProps<{ subscription: SubscriptionResource }>();

const { forceRefresh } = useSubscriptions();

const { execute: execute_toggle_favorite } = usePost(
  `/api/subscriptions/${subscription.id}/favorite`,
  { method: "POST" },
  { immediate: false },
);

const toggleFavorite = async () => {
  await execute_toggle_favorite();
  await refresh?.();

  if (subscription.is_favorite) {
    toast.success(`${subscription.name} a été ajouté à vos favoris`);
  } else {
    toast.success(`${subscription.name} a été retiré de vos favoris`);
  }

  await forceRefresh();
};
</script>

<template>
  <div class="mb-12 flex flex-col items-center gap-8 md:flex-row md:items-start">
    <div
      class="border-ui-border relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-4 shadow-xl"
    >
      <SubscriptionImage :subscription="subscription" class="h-full w-full object-cover" />
    </div>

    <div class="flex-1 text-center md:text-left">
      <div class="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <h1 class="text-ui-text-strong text-2xl font-bold md:text-4xl">{{ subscription.name }}</h1>

        <div class="flex flex-wrap justify-center gap-3">
          <Button
            :label="subscription.is_favorite ? 'Retirer' : 'Favoris'"
            :icon="subscription.is_favorite ? 'lucide:star-off' : 'lucide:star'"
            :color="subscription.is_favorite ? undefined : 'yellow'"
            @click="toggleFavorite"
          />

          <Button
            label="Ouvrir"
            icon="lucide:external-link"
            :to="subscription.channel.url"
            target="_blank"
            external
          />
        </div>
      </div>

      <div class="text-ui-text-muted mt-4 flex items-center justify-center gap-4 md:justify-start">
        <div class="flex items-center gap-1.5">
          <Icon
            :name="subscription.channel.service === 'youtube' ? 'lucide:youtube' : 'lucide:twitch'"
            class="h-5 w-5"
          />
          <span class="text-sm font-medium capitalize">{{ subscription.channel.service }}</span>
        </div>

        <span class="bg-ui-border h-1 w-1 rounded-full" />
        <span class="text-sm">1.2M abonnés</span>
        <span class="bg-ui-border h-1 w-1 rounded-full" />
        <span class="text-sm">450 vidéos</span>
      </div>

      <p class="text-ui-text mt-6 max-w-3xl text-lg leading-relaxed">
        Bienvenue sur la page de la chaîne {{ subscription.name }}. Vous pouvez retrouver ici toutes
        les dernières vidéos publiées sur {{ subscription.channel.service }}. Utilisez les filtres
        ci-dessous pour affiner votre recherche parmi le contenu de ce créateur.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-6 md:justify-start">
        <div class="flex flex-col">
          <span class="text-ui-text-muted text-xs font-bold tracking-wider uppercase">
            Dernière activité
          </span>
          <span class="text-ui-text-strong mt-1">Il y a 2 jours</span>
        </div>

        <div class="flex flex-col">
          <span class="text-ui-text-muted text-xs font-bold tracking-wider uppercase">
            Catégorie principale
          </span>
          <span class="text-ui-text-strong mt-1">Divertissement</span>
        </div>

        <div class="flex flex-col">
          <span class="text-ui-text-muted text-xs font-bold tracking-wider uppercase">Langue</span>
          <span class="text-ui-text-strong mt-1">Français</span>
        </div>
      </div>
    </div>
  </div>
</template>
