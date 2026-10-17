<script lang="ts" setup>
import type { DropdownItem } from "@watcher/ui";

import type { VideosValidators } from "#shared/validators/videos";
import type { VideoFilters, VideoFilterType } from "~/composables/videos/useVideosFilters";

type Query = VideosValidators["list"]["query"];

const filters = defineModel<VideoFilters>({ required: true });
const { hide = [] } = defineProps<{ hide?: Array<VideoFilterType> }>();

const { videos } = useFormatter();

const shown = (key: VideoFilterType) => !hide.includes(key);

const platforms = [
  { value: undefined, label: "Tout", icon: undefined },
  { value: "youtube", label: "YouTube", icon: "fa7-brands:youtube" },
  { value: "twitch", label: "Twitch", icon: "fa7-brands:twitch" },
] as const;

const DATES: Array<NonNullable<Query["date"]>> = ["today", "weekly", "monthly", "yearly", "older"];
const DURATIONS: Array<NonNullable<Query["duration"]>> = [
  "less_than_10_minutes",
  "between_10_30_minutes",
  "between_30_60_minutes",
  "greater_than_1_hour",
];

const date_items = computed<Array<DropdownItem>>(() => [
  { key: "date", label: "Toutes les dates", value: "all" },
  { key: "divider", label: "", type: "divider" },
  ...DATES.map((value) => ({ key: "date", label: videos.filters.date(value), value })),
]);

const duration_items = computed<Array<DropdownItem>>(() => [
  { key: "duration", label: "Toutes les durées", value: "all" },
  { key: "divider", label: "", type: "divider" },
  ...DURATIONS.map((value) => ({ key: "duration", label: videos.filters.duration(value), value })),
]);

const on_select = (key: string, value: string) => {
  const filter = key as "date" | "duration";
  filters.value[filter] = value === "all" ? undefined : (value as never);
};

const RESETTABLE = ["service", "date", "duration", "is_favorite"] as const;

const has_active_filters = computed(() =>
  RESETTABLE.some((key) => shown(key) && filters.value[key] !== undefined),
);

const reset = () => {
  for (const key of RESETTABLE) {
    if (shown(key)) {
      filters.value[key] = undefined;
    }
  }
};

// An active filter shows its value with a light accent, an inactive one stays neutral
const chip_ui = (active: boolean) => ({
  button: {
    root: active ? "!bg-alt/12 !ring-alt/30 [&_svg]:text-alt" : "",
  },
});
</script>

<template>
  <div
    class="-mx-4 flex [scrollbar-width:none] items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0"
    role="group"
    aria-label="Filtres"
  >
    <div
      v-if="shown('service')"
      class="bg-ui-text/[0.06] ring-ui-text/10 inline-flex shrink-0 rounded-full p-0.5 ring-1 ring-inset"
      role="radiogroup"
      aria-label="Plateforme"
    >
      <button
        v-for="platform in platforms"
        :key="platform.label"
        type="button"
        role="radio"
        :aria-checked="filters.service === platform.value"
        class="inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors"
        :class="
          filters.service === platform.value
            ? 'bg-ui-bg text-ui-text shadow-sm'
            : 'text-ui-text-muted hover:text-ui-text'
        "
        @click="filters.service = platform.value"
      >
        <Icon
          v-if="platform.icon"
          :name="platform.icon"
          :class="platform.value === 'youtube' ? 'text-[#ff0033]' : 'text-[#9146ff]'"
        />
        {{ platform.label }}
      </button>
    </div>

    <WatcherDropdownButton
      v-if="shown('date')"
      icon="lucide:calendar"
      size="sm"
      :label="filters.date ? videos.filters.date(filters.date) : 'Date'"
      :value="filters.date ?? 'all'"
      :items="date_items"
      :ui="chip_ui(!!filters.date)"
      @select="on_select"
    />

    <WatcherDropdownButton
      v-if="shown('duration')"
      icon="lucide:timer"
      size="sm"
      :label="filters.duration ? videos.filters.duration(filters.duration) : 'Durée'"
      :value="filters.duration ?? 'all'"
      :items="duration_items"
      :ui="chip_ui(!!filters.duration)"
      @select="on_select"
    />

    <WatcherButton
      v-if="shown('is_favorite')"
      icon="lucide:star"
      label="Favoris"
      size="sm"
      :aria-pressed="!!filters.is_favorite"
      :ui="chip_ui(!!filters.is_favorite).button"
      @click="filters.is_favorite = filters.is_favorite ? undefined : true"
    />

    <WatcherButton
      v-if="has_active_filters"
      label="Effacer"
      icon="lucide:x"
      size="sm"
      color="ghost"
      @click="reset"
    />
  </div>
</template>
