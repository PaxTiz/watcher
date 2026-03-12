<script lang="ts" setup>
import { Tippy } from "vue-tippy";

const { filters } = useVideosFilters();

const props = defineProps<{
  type: VideoFilterType;
  label: string;
  options: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
}>();

const onEmit = (value: string) => {
  filters.value[props.type] = value as any;
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
        class="bg-ui-border flex w-full min-w-[150px] flex-col items-start gap-0.5 rounded p-1 shadow-2xl"
      >
        <button
          v-for="option in options"
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
