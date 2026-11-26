<script lang="ts" setup>
import type { PreviewVideo } from "~/utils/preview";

defineProps<{ video: PreviewVideo; small?: boolean }>();
</script>

<template>
  <div
    class="relative aspect-video overflow-hidden"
    :class="small ? 'rounded-lg' : 'rounded-xl'"
    :style="{ background: SCENES[video.scene] }"
  >
    <span
      class="absolute font-semibold tabular-nums"
      :class="[
        small
          ? 'bottom-1 rounded px-[5px] py-px text-[10px]'
          : 'bottom-2 rounded-md px-[7px] py-0.5 text-xs',
        video.live
          ? [
              'bg-alt font-bold tracking-[0.05em] text-[#121521]',
              small ? 'left-1 text-[9px]' : 'left-2 text-[11px]',
            ]
          : ['bg-[rgb(8_9_12/0.8)] text-white', small ? 'right-1' : 'right-2'],
      ]"
    >
      {{ video.duration }}
    </span>
  </div>
</template>
