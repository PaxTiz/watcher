<script lang="ts" setup>
import { Tippy } from "vue-tippy";

const { filters } = useVideosFilters();

const props = defineProps<{
  type: VideoFilterType,
  label: string;
  options: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
}>();

const onEmit = (value: string) => {
  filters.value[props.type] = value as any;
}
</script>

<template>
  <Tippy placement="right-start" :delay="0" :duration="0" :offset="[-4, 8]" interactive>
    <div class="flex items-center justify-between text-ui-text text-sm p-1 hover:bg-ui-bg rounded">
      <span>{{ label }}</span>
      <Icon name="lucide:chevron-right" />
    </div>

    <template #content>
      <div
        class="shadow-2xl flex flex-col items-start gap-0.5 w-full min-w-[150px] bg-ui-border p-1 rounded"
      >
        <button
          v-for="option in options"
          :key="option.value"
          class="flex items-center gap-2 text-ui-text text-sm text-left w-full p-1 hover:bg-ui-bg rounded cursor-pointer"
          @click="() => onEmit(option.value)"
        >
          <Icon v-if="option.icon" :name="option.icon" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </template>
  </Tippy>
</template>
