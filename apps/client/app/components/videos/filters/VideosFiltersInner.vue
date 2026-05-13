<script lang="ts" generic="T extends string | number" setup>
import { Tippy } from "vue-tippy";

const {
  type,
  options,
  allowSearch = false,
} = defineProps<{
  type: VideoFilterType;
  label: string;
  options: Array<{
    label: string;
    value: T;
    icon?: string;
  }>;
  allowSearch?: boolean;
}>();

const { filters } = useVideosFilters();
const search_query = ref("");
const available_options = computed(() => {
  const q = search_query.value.toLowerCase();
  return options.filter((e) => e.label.toLowerCase().includes(q));
});

const onEmit = (value: T) => {
  filters.value[type] = value as any;
};
</script>

<template>
  <Tippy placement="right-start" :delay="0" :duration="0" :offset="[-4, 8]" interactive>
    <div class="text-ui-text hover:bg-ui-bg flex items-center justify-between rounded p-1 text-sm">
      <span>{{ label }}</span>
      <Icon name="lucide:chevron-right" />
    </div>

    <template #content>
      <div
        class="bg-ui-border flex max-h-[calc(224px+1.5rem)] w-full min-w-[150px] flex-col items-start gap-0.5 overflow-y-scroll rounded p-1 shadow-2xl"
      >
        <input
          v-if="allowSearch"
          v-model="search_query"
          class="text-ui-text bg-ui-bg w-full p-1 text-sm"
          placeholder="Rechercher par nom"
        />

        <button
          v-for="option in available_options"
          :key="option.value"
          class="text-ui-text hover:bg-ui-bg flex w-full cursor-pointer items-center gap-2 rounded p-1 text-left text-sm"
          @click="() => onEmit(option.value)"
        >
          <Icon v-if="option.icon" :name="option.icon" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </template>
  </Tippy>
</template>
