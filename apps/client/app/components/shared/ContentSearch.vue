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

const { t } = useI18n();

const query = ref("");
const results = ref<SearchResults>({ channels: [], videos: [] });
const loading = ref(false);
const error = ref<string | null>(null);
const filters = reactive<SearchFilters>({ type: "all", duration: "any", sort: "relevance" });

const toOptions = <T extends string>(group: string, values: Array<T>) =>
  values.map((value) => ({ value, label: t(`search.${group}.${value}`) }));

const typeOptions = computed(() => toOptions<SearchType>("types", ["all", "videos", "channels"]));

const durationOptions = computed(() =>
  toOptions<DurationFilter>("durations", ["any", "short", "medium", "long"]),
);

const sortOptions = computed(() =>
  toOptions<SortFilter>("sorts", ["relevance", "recent", "views"]),
);

const showVideoFilters = computed(() => filters.type !== "channels");

const items = computed<CommandItem<SearchResult>[]>(() => [
  ...results.value.channels.map((channel) => ({
    id: `channel:${channel.id}`,
    label: channel.name,
    group: t("search.types.channels"),
    data: { kind: "channel" as const, channel },
  })),
  ...results.value.videos.map((video) => ({
    id: `video:${video.id}`,
    label: video.title,
    group: t("search.types.videos"),
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
    error.value = t("search.failed");
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
  if (q.length < minChars) return t("search.min_chars", { count: minChars });
  return t("search.no_results", { query: q });
});

const { numbers } = useFormatter();

const formatViews = (views?: number) =>
  views == null ? "" : t("search.views", { count: numbers.compact(views) });
const formatSubscribers = (n?: number) =>
  n == null ? "" : t("search.subscribers", { count: numbers.compact(n) }, n);

const filterGroups = computed(() => [
  {
    key: "type" as const,
    label: t("search.filters.type"),
    options: typeOptions.value,
    visible: true,
  },
  {
    key: "duration" as const,
    label: t("search.filters.duration"),
    options: durationOptions.value,
    visible: showVideoFilters.value,
  },
  {
    key: "sort" as const,
    label: t("search.filters.sort"),
    options: sortOptions.value,
    visible: showVideoFilters.value,
  },
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
    :placeholder="t('search.placeholder')"
    :title="t('search.title')"
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
