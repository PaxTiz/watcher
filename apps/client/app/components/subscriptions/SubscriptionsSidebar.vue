<script lang="ts" setup>
import type { SubscriptionResource } from "@watcher/common";
import { differenceInHours } from "date-fns";

const { data, favorites, others } = useSubscriptions();
const route = useRoute();

const search = ref("");
const serviceFilter = ref<"youtube" | "twitch" | null>(null);

const serviceItems = [
  { key: "service", label: "Tous les services", value: "all", icon: "lucide:layers" },
  { key: "service", label: "YouTube", value: "youtube", icon: "fa7-brands:youtube" },
  { key: "service", label: "Twitch", value: "twitch", icon: "fa7-brands:twitch" },
];

const currentServiceIcon = computed(() => {
  if (serviceFilter.value === "youtube") return "fa7-brands:youtube";
  if (serviceFilter.value === "twitch") return "fa7-brands:twitch";
  return "lucide:layers";
});

const onServiceSelect = (_key: string, value: string) => {
  if (value === "all") {
    serviceFilter.value = null;
  } else {
    serviceFilter.value = value as "youtube" | "twitch";
  }
};

const filterList = (list: Array<SubscriptionResource>) => {
  return list.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(search.value.toLowerCase());
    const matchesService = !serviceFilter.value || sub.channel.service === serviceFilter.value;
    return matchesSearch && matchesService;
  });
};

const filteredFavorites = computed(() => filterList(favorites.value));
const filteredOthers = computed(() => filterList(others.value));

const groups = computed(() =>
  [
    { label: "Favoris", items: filteredFavorites.value },
    { label: "Abonnements", items: filteredOthers.value },
  ].filter((group) => group.items.length > 0),
);

const has_new_video = (sub: SubscriptionResource) => {
  return !!sub.last_video_at && differenceInHours(new Date(), sub.last_video_at) < 24;
};

const is_active = (sub: SubscriptionResource) => route.path === `/subscriptions/${sub.slug}`;
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center gap-1 px-3 pt-4 pb-2">
      <div class="relative flex-1">
        <Icon
          name="lucide:list-filter"
          class="text-ui-text-muted pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm"
        />
        <input
          v-model="search"
          type="text"
          :placeholder="`Filtrer ${data?.length ?? ''} abonnements`"
          aria-label="Filtrer les abonnements"
          class="hover:!bg-ui-border/40 focus:!bg-ui-bg h-8 w-full !border-transparent !bg-transparent pl-8 text-sm transition-colors"
        />
      </div>

      <WatcherDropdownButton
        :items="serviceItems"
        :icon="currentServiceIcon"
        :value="serviceFilter ?? 'all'"
        aria-label="Filtrer par service"
        color="ghost"
        size="sm"
        align="end"
        @select="onServiceSelect"
      />
    </div>

    <div class="scrollbar-thumb-ui-border min-h-0 flex-1 scrollbar-thin overflow-y-auto px-3 pb-6">
      <section v-for="group in groups" :key="group.label" class="mt-3">
        <h3 class="text-ui-text-muted mb-1 px-3 text-[0.7rem] font-bold tracking-wider uppercase">
          {{ group.label }}
        </h3>

        <ul>
          <li v-for="sub in group.items" :key="sub.id">
            <NuxtLink
              :to="`/subscriptions/${sub.slug}`"
              :aria-current="is_active(sub) ? 'page' : undefined"
              class="flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors"
              :class="[
                is_active(sub)
                  ? 'bg-ui-border/60 text-ui-text font-semibold'
                  : 'text-ui-text/85 hover:bg-ui-border/40 hover:text-ui-text',
                { 'opacity-50 grayscale': sub.is_hidden },
              ]"
            >
              <NuxtImg
                class="bg-ui-border size-6 shrink-0 rounded-full object-cover"
                loading="lazy"
                format="avif,webp"
                width="24"
                height="24"
                :src="sub.channel.logo"
                alt=""
              />

              <span class="min-w-0 flex-1 truncate">{{ sub.name }}</span>

              <Icon
                v-if="sub.is_hidden"
                name="lucide:eye-off"
                class="text-ui-text-muted shrink-0 text-xs"
                aria-label="Masqué"
              />
              <span
                v-else-if="has_new_video(sub)"
                class="bg-alt size-1.5 shrink-0 rounded-full"
                title="Nouvelle vidéo ces dernières 24 heures"
              />
            </NuxtLink>
          </li>
        </ul>
      </section>

      <p v-if="groups.length === 0" class="text-ui-text-muted px-3 py-8 text-center text-sm">
        Aucun abonnement trouvé.
      </p>
    </div>
  </div>
</template>
