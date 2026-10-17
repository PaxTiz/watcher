<script lang="ts" setup>
import type { PreviewVideo } from "~/utils/preview";

const { video, showDuration = true } = defineProps<{
  video: PreviewVideo;
  showDuration?: boolean;
  progress?: number;
}>();

const { t, te } = useI18n();
const uid = useId();

const svg = computed(() => {
  const index = PREVIEW_VIDEOS.findIndex((v) => v.key === video.key);
  const hookKey = `videos.hooks.${video.key}`;
  return preview_scene(
    index,
    video.platform,
    te(hookKey) ? t(hookKey) : "",
    uid.replaceAll(":", ""),
  );
});
</script>

<template>
  <div class="relative aspect-video max-w-full overflow-hidden rounded-[10px] bg-[#ddd]">
    <div class="size-full [&_svg]:block [&_svg]:size-full" v-html="svg" />
    <span
      v-if="showDuration"
      class="absolute right-1.5 bottom-1.5 rounded-[5px] bg-[rgb(12_12_14/0.78)] px-1.5 text-[10px] leading-4 font-medium text-white tabular-nums"
    >
      {{ video.duration }}
    </span>
    <span v-if="progress" class="absolute inset-x-0 bottom-0 h-[3px] bg-white/50">
      <span class="bg-alt block h-full" :style="{ width: `${progress}%` }" />
    </span>
  </div>
</template>
