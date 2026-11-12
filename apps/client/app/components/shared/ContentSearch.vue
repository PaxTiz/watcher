<script setup lang="ts">
import type { CommandItem, DropdownItem } from "@watcher/ui";

import {
  type SearchFilters,
  type SearchResult,
  type SearchResults,
  type SearchType,
  empty_search_results,
} from "~/utils/search";

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
const results = ref<SearchResults>(empty_search_results());
const loading = ref(false);
const error = ref<string | null>(null);
const filters = reactive<SearchFilters>({
  type: "all",
  duration: "any",
  sort: "relevance",
  mentions: [],
});

const toOptions = <T extends string>(group: string, values: Array<T>) =>
  values.map((value) => ({ value, label: t(`search.${group}.${value}`) }));

const typeOptions = computed(() => toOptions<SearchType>("types", ["all", "videos", "channels"]));

const durationItems = computed<Array<DropdownItem>>(() => [
  { key: "duration", label: t("search.durations.any"), value: "any" },
  { key: "divider", label: "", type: "divider" },
  ...toOptions<SearchFilters["duration"]>("durations", [
    "less_than_10_minutes",
    "between_10_30_minutes",
    "between_30_60_minutes",
    "greater_than_1_hour",
  ]).map(({ value, label }) => ({ key: "duration", label, value })),
]);

const sortItems = computed<Array<DropdownItem>>(() =>
  toOptions<SearchFilters["sort"]>("sorts", ["relevance", "recent"]).map(({ value, label }) => ({
    key: "sort",
    label,
    value,
  })),
);

const mentionOptions = computed(() => {
  const counts = new Map(results.value.mentions.map((m) => [m.handle, m.videos_count]));

  return [
    ...filters.mentions.map((handle) => ({ handle, count: counts.get(handle), selected: true })),
    ...results.value.mentions
      .filter((m) => !filters.mentions.includes(m.handle))
      .map((m) => ({ handle: m.handle, count: m.videos_count, selected: false })),
  ];
});

const toggleMention = (handle: string) => {
  filters.mentions = filters.mentions.includes(handle)
    ? filters.mentions.filter((m) => m !== handle)
    : [...filters.mentions, handle];
};

const canSearch = (q: string) => q.length >= minChars || filters.mentions.length > 0;

const showVideoFilters = computed(() => filters.type !== "channels");
const showMentions = computed(() => showVideoFilters.value && mentionOptions.value.length > 0);

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

  if (!canSearch(q)) {
    results.value = empty_search_results();
    error.value = null;
    loading.value = false;
    return;
  }

  const current = new AbortController();
  controller = current;
  loading.value = true;
  error.value = null;

  try {
    const data = await searchFn(q.length >= minChars ? q : "", { ...filters }, current.signal);
    if (current.signal.aborted) return;
    results.value = data;
  } catch (e) {
    if (current.signal.aborted || (e as Error).name === "AbortError") return;
    results.value = empty_search_results();
    error.value = t("search.failed");
  } finally {
    if (!current.signal.aborted) loading.value = false;
  }
}

watch(
  [
    query,
    () => filters.type,
    () => filters.duration,
    () => filters.sort,
    () => filters.mentions.join(),
  ],
  () => {
    clearTimeout(timer);
    if (!canSearch(query.value.trim())) {
      run();
      return;
    }
    loading.value = true;
    timer = setTimeout(run, debounce);
  },
);

onBeforeUnmount(() => {
  clearTimeout(timer);
  controller?.abort();
});

const emptyMessage = computed(() => {
  const q = query.value.trim();
  if (error.value) return error.value;
  if (!canSearch(q)) return t("search.min_chars", { count: minChars });
  return t("search.no_results", {
    query: q.length >= minChars ? q : filters.mentions.map((m) => `@${m}`).join(" "),
  });
});

const { numbers, videos: videosFormatter } = useFormatter();

const setFilter = (key: string, value: string) => {
  (filters as Record<"duration" | "sort", string>)[key as "duration" | "sort"] = value;
};

const chipUi = (active: boolean) => ({
  button: {
    root: active ? "!bg-alt/12 !ring-alt/30 [&_svg]:text-alt" : "",
  },
});
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
        <div
          class="bg-ui-text/[0.06] ring-ui-text/10 inline-flex shrink-0 rounded-full p-0.5 ring-1 ring-inset"
          role="radiogroup"
          :aria-label="t('search.filters.type')"
        >
          <button
            v-for="option in typeOptions"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="filters.type === option.value"
            class="focus-visible:outline-alt inline-flex h-7 items-center rounded-full px-3 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2"
            :class="
              filters.type === option.value
                ? 'bg-ui-bg text-ui-text shadow-sm'
                : 'text-ui-text-muted hover:text-ui-text'
            "
            @click="filters.type = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <template v-if="showVideoFilters">
          <WatcherDropdownButton
            icon="lucide:timer"
            size="sm"
            :label="
              filters.duration === 'any'
                ? t('search.filters.duration')
                : t(`search.durations.${filters.duration}`)
            "
            :value="filters.duration"
            :items="durationItems"
            :ui="chipUi(filters.duration !== 'any')"
            @select="setFilter"
          />

          <WatcherDropdownButton
            icon="lucide:arrow-down-wide-narrow"
            size="sm"
            :label="t(`search.sorts.${filters.sort}`)"
            :aria-label="t('search.filters.sort')"
            :value="filters.sort"
            :items="sortItems"
            :ui="chipUi(filters.sort !== 'relevance')"
            @select="setFilter"
          />
        </template>
      </div>

      <div
        v-if="showMentions"
        class="border-ui-text/10 flex shrink-0 [scrollbar-width:none] items-center gap-2 overflow-x-auto border-b px-4 py-2.5"
        role="group"
        :aria-label="t('search.filters.mentions')"
        @mousedown.prevent
      >
        <button
          v-for="mention in mentionOptions"
          :key="mention.handle"
          type="button"
          :aria-pressed="mention.selected"
          class="focus-visible:outline-alt inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium whitespace-nowrap ring-1 transition-colors ring-inset focus-visible:outline-2"
          :class="
            mention.selected
              ? 'bg-ui-text text-ui-bg ring-transparent'
              : 'bg-ui-text/[0.06] ring-ui-text/10 text-ui-text-muted hover:text-ui-text'
          "
          @click="toggleMention(mention.handle)"
        >
          @{{ mention.handle }}
          <span v-if="mention.count != null" class="tabular-nums opacity-60">{{
            mention.count
          }}</span>
        </button>
      </div>
    </template>

    <template #item="{ item }">
      <template v-if="item.data.kind === 'channel'">
        <div class="flex w-32 shrink-0 justify-center max-sm:w-24">
          <img
            :src="item.data.channel.channel.logo"
            alt=""
            loading="lazy"
            class="bg-ui-border size-12 rounded-full object-cover"
          />
        </div>

        <div class="min-w-0">
          <p class="text-ui-text truncate font-medium">{{ item.data.channel.name }}</p>
          <p class="text-ui-text-muted mt-0.5 text-[13px]">
            {{ videosFormatter.filters.service(item.data.channel.channel.service) }}
          </p>
        </div>
      </template>

      <template v-else>
        <div
          class="bg-ui-border/40 relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg shadow-[0_0_0_1px_rgb(255_255_255/0.06)] max-sm:w-24"
        >
          <img
            :src="item.data.video.thumbnails.small"
            alt=""
            loading="lazy"
            class="size-full object-cover"
          />
          <span
            v-if="item.data.video.duration"
            class="absolute right-1 bottom-1 rounded-md bg-black/75 px-1 py-px text-[11px] font-semibold text-white tabular-nums"
          >
            {{ numbers.displaySeconds(item.data.video.duration) }}
          </span>
        </div>

        <div class="min-w-0">
          <p class="text-ui-text line-clamp-2 leading-snug font-medium">
            {{ item.data.video.title }}
          </p>
          <p class="text-ui-text-muted mt-1 truncate text-[13px]">
            {{ item.data.video.author.name }}
          </p>
        </div>
      </template>
    </template>

    <template #empty>{{ emptyMessage }}</template>
  </WatcherCommandPalette>
</template>
