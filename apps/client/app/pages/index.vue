<script lang="ts" setup>
import { isToday, isYesterday, subDays, isAfter } from "date-fns";
import { toast } from "vue-sonner";

import type { VideoResource } from "#shared/resources/videos";
import type { Paginated } from "#shared/types/shared";

const { data: subscriptions, refresh: refreshSubscriptions } = useSubscriptions();

const { dates } = useFormatter();
const lastSyncedAt = computed(() => {
  if (!subscriptions.value || subscriptions.value.length === 0) return null;
  const syncDates = subscriptions.value
    .map((s) => (s.last_synced_at ? new Date(s.last_synced_at).getTime() : 0))
    .filter((t) => t > 0);

  if (syncDates.length === 0) return null;
  return new Date(Math.max(...syncDates)).toISOString();
});

const { data: favoriteVideos, refresh: refreshFavorites } = await useAppFetch<
  Paginated<VideoResource>
>("/api/videos", {
  query: { page: 1, is_favorite: true },
});

const {
  data: videos,
  refresh: refreshVideos,
  status: videosStatus,
} = await useAppFetch<Paginated<VideoResource>>("/api/videos", {
  query: { page: 1 },
});

useOAuthRedirectionHandler();

// Grouping logic
const groupedVideos = computed(() => {
  if (!videos.value) return [];

  const groups: Record<string, VideoResource[]> = {
    "Aujourd'hui": [],
    Hier: [],
    "Cette semaine": [],
    Anciennement: [],
  };

  const now = new Date();
  const weekAgo = subDays(now, 7);

  for (const video of videos.value.items) {
    const date = new Date(video.created_at);
    if (isToday(date)) {
      groups["Aujourd'hui"].push(video);
    } else if (isYesterday(date)) {
      groups["Hier"].push(video);
    } else if (isAfter(date, weekAgo)) {
      groups["Cette semaine"].push(video);
    } else {
      groups["Anciennement"].push(video);
    }
  }

  return Object.entries(groups).filter(([_, items]) => items.length > 0);
});

const isSyncing = ref(false);
const sync = async () => {
  if (isSyncing.value) return;

  isSyncing.value = true;
  const toastId = toast.loading("Mise à jour de vos flux...");

  try {
    await $fetch("/api/subscriptions/sync", { method: "POST" });
    await Promise.all([refreshSubscriptions(), refreshFavorites(), refreshVideos()]);
    toast.success("Tout est à jour !", { id: toastId });
  } catch (error) {
    console.error("Sync failed", error);
    toast.error("Échec de la synchronisation.", { id: toastId });
  } finally {
    isSyncing.value = false;
  }
};
</script>

<template>
  <div class="space-y-8 md:space-y-12">
    <!-- Header simple -->
    <div
      class="border-ui-border flex flex-col gap-4 border-b pb-8 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-ui-text text-2xl font-black tracking-tight md:text-3xl">Tableau de bord</h1>
        <p class="text-ui-text-muted mt-1 text-sm font-medium md:text-base">
          Découvrez les dernières sorties de vos créateurs.
        </p>
      </div>

      <div
        v-if="lastSyncedAt"
        class="text-ui-text-muted flex items-center gap-2 text-xs font-medium md:text-sm"
      >
        <Icon name="lucide:history" class="text-base md:text-lg" />
        <span>Dernière synchronisation {{ dates.ago(lastSyncedAt) }}</span>
      </div>
    </div>

    <!-- Section Favoris Compacte -->
    <section v-if="favoriteVideos && favoriteVideos.items.length > 0">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-ui-text flex items-center gap-2 text-xl font-bold">
          <Icon name="lucide:star" class="text-yellow-500" />
          Vos Favoris
        </h2>
        <NuxtLink to="/videos?is_favorite=true" class="text-alt text-sm font-bold hover:underline"
          >Voir tout</NuxtLink
        >
      </div>

      <div class="infinite-grid-[300px] gap-6">
        <VideoCard
          v-for="video in favoriteVideos.items.slice(0, 4)"
          :key="video.id"
          :id="video.id"
          :video="video"
          class="!border-ui-border/50"
        />
      </div>
    </section>

    <!-- Flux Chronologique -->
    <section class="space-y-12">
      <div
        v-if="videosStatus === 'pending'"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div v-for="i in 6" :key="i" class="bg-ui-border/20 h-64 animate-pulse rounded-2xl"></div>
      </div>

      <template v-else>
        <div v-for="[group, items] in groupedVideos" :key="group" class="space-y-6">
          <div class="flex items-center gap-4">
            <h3 class="text-ui-text-muted text-lg font-bold tracking-widest uppercase">
              {{ group }}
            </h3>
            <div class="bg-ui-border h-[1px] flex-1"></div>
          </div>

          <div class="infinite-grid-[300px] gap-6">
            <VideoCard
              v-for="video in items"
              :key="video.id"
              :id="video.id"
              :video="video"
              class="!border-ui-border/50"
            />
          </div>
        </div>

        <div
          v-if="groupedVideos.length === 0"
          class="flex flex-col items-center justify-center py-20 text-center"
        >
          <Icon name="lucide:video-off" class="text-ui-border mb-4 text-6xl" />
          <p class="text-ui-text-muted text-xl font-bold">Aucune vidéo à afficher.</p>
          <p class="text-ui-text-muted">Lancez une synchronisation pour récupérer du contenu.</p>
        </div>
      </template>

      <div class="flex justify-center pt-8">
        <NuxtLink
          to="/videos"
          class="bg-ui-bg border-ui-border text-ui-text hover:border-alt hover:text-alt rounded-full border-2 px-8 py-3 font-bold transition-all"
        >
          Accéder à toute la bibliothèque
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
