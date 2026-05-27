<script lang="ts" setup>
const { favorites, others } = useSubscriptions();

const search = ref("");
const serviceFilter = ref<"youtube" | "twitch" | null>(null);
const showAll = ref(false);

const filterList = (list: any[]) => {
  return list.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(search.value.toLowerCase());
    const matchesService = !serviceFilter.value || sub.channel.service === serviceFilter.value;
    return matchesSearch && matchesService;
  });
};

const filteredFavorites = computed(() => filterList(favorites.value));
const filteredOthers = computed(() => filterList(others.value));

const toggleService = (service: "youtube" | "twitch") => {
  if (serviceFilter.value === service) {
    serviceFilter.value = null;
  } else {
    serviceFilter.value = service;
  }
};
</script>

<template>
  <aside
    class="scrollbar-thumb-ui-border sticky top-24 h-[calc(100vh-120px)] w-64 shrink-0 scrollbar-thin overflow-y-auto pr-4"
  >
    <!-- Filtres -->
    <div class="mb-6 space-y-3 px-2">
      <div class="relative">
        <Icon
          name="lucide:search"
          class="text-ui-text-muted absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher..."
          class="bg-ui-bg border-ui-border focus:border-alt focus:ring-alt w-full rounded-lg py-2 pr-4 pl-10 text-base outline-hidden transition-all focus:ring-1 lg:text-sm"
        />
      </div>

      <div class="flex gap-2">
        <button
          @click="toggleService('youtube')"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-1.5 text-xs font-bold transition-all"
          :class="
            serviceFilter === 'youtube'
              ? 'border-red-500 bg-red-500/10 text-red-500'
              : 'border-ui-border bg-ui-bg text-ui-text-muted hover:border-ui-border-hover'
          "
        >
          <Icon name="fa7-brands:youtube" />
          YouTube
        </button>
        <button
          @click="toggleService('twitch')"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-1.5 text-xs font-bold transition-all"
          :class="
            serviceFilter === 'twitch'
              ? 'border-purple-500 bg-purple-500/10 text-purple-500'
              : 'border-ui-border bg-ui-bg text-ui-text-muted hover:border-ui-border-hover'
          "
        >
          <Icon name="fa7-brands:twitch" />
          Twitch
        </button>
      </div>
    </div>

    <div v-if="filteredFavorites.length > 0" class="mb-8">
      <h3 class="text-ui-text-muted mb-4 px-2 text-xs font-bold tracking-wider uppercase">
        Favoris
      </h3>
      <ul class="space-y-1">
        <li v-for="sub in filteredFavorites" :key="sub.id">
          <SubscriptionsSidebarItem :subscription="sub" />
        </li>
      </ul>
    </div>

    <div v-if="filteredOthers.length > 0">
      <h3 class="text-ui-text-muted mb-4 px-2 text-xs font-bold tracking-wider uppercase">
        Abonnements
      </h3>
      <ul class="space-y-1">
        <li v-for="sub in filteredOthers.slice(0, showAll ? undefined : 10)" :key="sub.id">
          <SubscriptionsSidebarItem :subscription="sub" />
        </li>
      </ul>

      <button
        v-if="filteredOthers.length > 10"
        class="text-alt mt-2 flex w-full items-center gap-1 px-2 text-left text-xs font-semibold hover:underline"
        @click="showAll = !showAll"
      >
        <Icon :name="showAll ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
        {{ showAll ? "Voir moins" : `Voir tout (${filteredOthers.length})` }}
      </button>
    </div>

    <!-- État vide -->
    <div
      v-if="filteredFavorites.length === 0 && filteredOthers.length === 0"
      class="px-2 py-8 text-center"
    >
      <p class="text-ui-text-muted text-sm font-medium">Aucun résultat trouvé.</p>
    </div>
  </aside>
</template>
