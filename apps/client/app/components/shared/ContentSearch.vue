<script setup lang="ts">
import type {
  CommandItem,
  DurationFilter,
  SearchFilters,
  SearchResult,
  SearchResults,
  SearchType,
  SortFilter,
} from "@watcher/ui";

const {
  debounce = 250,
  minChars = 2,
  searchFn,
} = defineProps<{
  searchFn: (query: string, filters: SearchFilters, signal: AbortSignal) => Promise<SearchResults>;
  debounce?: number;
  minChars?: number;
}>();

const emit = defineEmits<{
  select: [result: SearchResult];
  close: [result?: SearchResult];
}>();

const query = ref("");
const results = ref<SearchResults>({ channels: [], videos: [] });
const loading = ref(false);
const error = ref<string | null>(null);
const filters = reactive<SearchFilters>({ type: "all", duration: "any", sort: "relevance" });

const typeOptions: { value: SearchType; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "videos", label: "Vidéos" },
  { value: "channels", label: "Chaînes" },
];

const durationOptions: { value: DurationFilter; label: string }[] = [
  { value: "any", label: "Toutes durées" },
  { value: "short", label: "< 4 min" },
  { value: "medium", label: "4–20 min" },
  { value: "long", label: "> 20 min" },
];

const sortOptions: { value: SortFilter; label: string }[] = [
  { value: "relevance", label: "Pertinence" },
  { value: "recent", label: "Récentes" },
  { value: "views", label: "Populaires" },
];

const showVideoFilters = computed(() => filters.type !== "channels");

const items = computed<CommandItem<SearchResult>[]>(() => [
  ...results.value.channels.map((channel) => ({
    id: `channel:${channel.id}`,
    label: channel.name,
    group: "Chaînes",
    data: { kind: "channel" as const, channel },
  })),
  ...results.value.videos.map((video) => ({
    id: `video:${video.id}`,
    label: video.title,
    group: "Vidéos",
    data: { kind: "video" as const, video },
  })),
]);

let timer: ReturnType<typeof setTimeout> | undefined;
let controller: AbortController | undefined;

async function run() {
  controller?.abort();
  const q = query.value.trim();

  if (q.length < minChars) {
    results.value = { channels: [], videos: [] };
    error.value = null;
    loading.value = false;
    return;
  }

  const current = new AbortController();
  controller = current;
  loading.value = true;
  error.value = null;

  try {
    const data = await searchFn(q, { ...filters }, current.signal);
    if (current.signal.aborted) return;
    results.value = data;
  } catch (e) {
    if (current.signal.aborted || (e as Error).name === "AbortError") return;
    results.value = { channels: [], videos: [] };
    error.value = "La recherche a échoué. Réessayez dans un instant.";
  } finally {
    if (!current.signal.aborted) loading.value = false;
  }
}

watch([query, () => filters.type, () => filters.duration, () => filters.sort], () => {
  clearTimeout(timer);
  if (query.value.trim().length < minChars) {
    run();
    return;
  }
  loading.value = true;
  timer = setTimeout(run, debounce);
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  controller?.abort();
});

const emptyMessage = computed(() => {
  const q = query.value.trim();
  if (error.value) return error.value;
  if (q.length < minChars) return `Tapez au moins ${minChars} caractères pour lancer la recherche.`;
  return `Aucun résultat pour « ${q} ».`;
});

const { numbers } = useFormatter();

const compact = new Intl.NumberFormat("fr", { notation: "compact", maximumFractionDigits: 1 });
const formatViews = (views?: number) => (views == null ? "" : `${compact.format(views)} vues`);
const formatSubscribers = (n?: number) =>
  n == null ? "" : `${compact.format(n)} ${n > 1 ? "abonnés" : "abonné"}`;

const filterGroups = computed(() => [
  { key: "type" as const, label: "Type de résultat", options: typeOptions, visible: true },
  {
    key: "duration" as const,
    label: "Durée",
    options: durationOptions,
    visible: showVideoFilters.value,
  },
  { key: "sort" as const, label: "Tri", options: sortOptions, visible: showVideoFilters.value },
]);

const setFilter = (key: keyof SearchFilters, value: string) => {
  (filters as Record<keyof SearchFilters, string>)[key] = value;
};
</script>

<template>
  <WatcherCommandPalette
    v-model:search="query"
    :items="items"
    :loading="loading"
    manual-filter
    placeholder="Rechercher une vidéo ou une chaîne…"
    title="Recherche"
    @select="(item) => emit('select', item.data)"
    @close="(item) => emit('close', item?.data)"
  >
    <template #filters>
      <div
        class="border-ui-text/10 flex shrink-0 [scrollbar-width:none] items-center gap-2 overflow-x-auto border-b px-4 py-2.5"
        @mousedown.prevent
      >
        <template v-for="group in filterGroups" :key="group.key">
          <div
            v-if="group.visible"
            class="bg-ui-text/[0.06] ring-ui-text/10 inline-flex shrink-0 rounded-full p-0.5 ring-1 ring-inset"
            role="radiogroup"
            :aria-label="group.label"
          >
            <button
              v-for="option in group.options"
              :key="option.value"
              type="button"
              role="radio"
              :aria-checked="filters[group.key] === option.value"
              class="focus-visible:outline-alt inline-flex h-7 items-center rounded-full px-3 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2"
              :class="
                filters[group.key] === option.value
                  ? 'bg-ui-bg text-ui-text shadow-sm'
                  : 'text-ui-text-muted hover:text-ui-text'
              "
              @click="setFilter(group.key, option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </template>
      </div>
    </template>

    <template #item="{ item }">
      <template v-if="item.data.kind === 'channel'">
        <div class="flex w-32 shrink-0 justify-center max-sm:w-24">
          <img
            :src="item.data.channel.avatar"
            alt=""
            loading="lazy"
            class="bg-ui-border size-12 rounded-full object-cover"
          />
        </div>

        <div class="min-w-0">
          <p class="text-ui-text truncate font-medium">{{ item.data.channel.name }}</p>
          <p class="text-ui-text-muted mt-0.5 flex items-center gap-1.5 text-[13px]">
            <span v-if="item.data.channel.handle" class="truncate">
              {{ item.data.channel.handle }}
            </span>
            <template v-if="item.data.channel.subscribers != null">
              <span v-if="item.data.channel.handle" aria-hidden="true">·</span>
              <span class="shrink-0">{{ formatSubscribers(item.data.channel.subscribers) }}</span>
            </template>
          </p>
        </div>
      </template>

      <template v-else>
        <div
          class="bg-ui-border/40 relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg shadow-[0_0_0_1px_rgb(255_255_255/0.06)] max-sm:w-24"
        >
          <img
            :src="item.data.video.thumbnail"
            alt=""
            loading="lazy"
            class="size-full object-cover"
          />
          <span
            v-if="item.data.video.duration != null"
            class="absolute right-1 bottom-1 rounded-md bg-black/75 px-1 py-px text-[11px] font-semibold text-white tabular-nums"
          >
            {{ numbers.displaySeconds(item.data.video.duration) }}
          </span>
        </div>

        <div class="min-w-0">
          <p class="text-ui-text line-clamp-2 leading-snug font-medium">
            {{ item.data.video.title }}
          </p>
          <p class="text-ui-text-muted mt-1 flex items-center gap-1.5 text-[13px]">
            <span class="truncate">{{ item.data.video.author }}</span>
            <template v-if="item.data.video.views != null">
              <span aria-hidden="true">·</span>
              <span class="shrink-0">{{ formatViews(item.data.video.views) }}</span>
            </template>
          </p>
        </div>
      </template>
    </template>

    <template #empty>{{ emptyMessage }}</template>
  </WatcherCommandPalette>
</template>
