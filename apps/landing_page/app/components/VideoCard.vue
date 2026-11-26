<script lang="ts" setup>
import type { PreviewVideo } from "~/utils/preview";

const { video } = defineProps<{ video: PreviewVideo }>();

const { t } = useI18n();

const creator = computed(() => CREATORS[video.creator]);
</script>

<template>
  <div class="flex min-w-0 flex-col gap-2.5">
    <VideoThumb :video="video" />
    <div class="flex items-start gap-2.5">
      <CreatorAvatar :initials="creator.initials" :color="creator.color" />
      <div class="flex min-w-0 flex-col gap-[3px]">
        <p class="text-ui-text line-clamp-2 text-sm leading-[1.3] font-medium">
          {{ t(`videos.items.${video.key}.title`) }}
        </p>
        <p class="text-ui-text-muted flex items-center gap-1.5 text-xs">
          <PlatformDot :platform="video.platform" />
          <span class="truncate">
            {{ creator.name }} ·
            {{ video.live ? t("videos.live_now") : t(`videos.items.${video.key}.when`) }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>
