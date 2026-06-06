<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

const { favorites, others } = useSubscriptions();

const search = ref("");
const serviceFilter = ref<"youtube" | "twitch" | null>(null);
const showAll = ref(false);

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
</script>

<template>
  <aside
    class="scrollbar-thumb-ui-border sticky top-28 h-[calc(100vh-120px)] w-64 shrink-0 scrollbar-thin overflow-y-auto pr-4"
  >
    <div class="sticky top-0 z-10">
      <div class="relative flex items-center">
        <AppFormInput v-model="search" placeholder="Rechercher" class="w-full border-2" />
        <div class="absolute right-1">
          <DropdownButton
            :items="serviceItems"
            :icon="currentServiceIcon"
            :value="serviceFilter ?? 'all'"
            color="ghost"
            align="center"
            @select="onServiceSelect"
          />
        </div>
      </div>
    </div>

    <div v-if="filteredFavorites.length > 0" class="mt-8">
      <h3 class="text-ui-text-muted mb-4 px-2 text-xs font-bold tracking-wider uppercase">
        Favoris
      </h3>
      <ul class="space-y-1">
        <li v-for="sub in filteredFavorites" :key="sub.id">
          <SubscriptionImageWithAuthor
            :slug="sub.slug"
            :name="sub.name"
            :image="sub.channel.logo"
            size="sm"
            with-hover
          />
        </li>
      </ul>
    </div>

    <div v-if="filteredOthers.length > 0" class="mt-8">
      <h3 class="text-ui-text-muted mb-4 px-2 text-xs font-bold tracking-wider uppercase">
        Abonnements
      </h3>
      <ul class="space-y-1">
        <li v-for="sub in filteredOthers.slice(0, showAll ? undefined : 8)" :key="sub.id">
          <SubscriptionImageWithAuthor
            :slug="sub.slug"
            :name="sub.name"
            :image="sub.channel.logo"
            :hidden="sub.is_hidden"
            size="sm"
            with-hover
          />
        </li>
      </ul>

      <div v-if="filteredOthers.length > 10" class="my-8 flex w-full justify-center">
        <button
          class="text-alt inline-flex items-center gap-1 px-2 text-left text-xs font-semibold hover:underline"
          @click="showAll = !showAll"
        >
          <Icon :name="showAll ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
          {{ showAll ? "Voir moins" : `Voir tout (${filteredOthers.length})` }}
        </button>
      </div>
    </div>

    <div
      v-if="filteredFavorites.length === 0 && filteredOthers.length === 0"
      class="mt-8 px-2 py-8 text-center"
    >
      <p class="text-ui-text-muted text-sm font-medium">Aucun résultat trouvé.</p>
    </div>
  </aside>
</template>
