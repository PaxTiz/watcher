<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";

defineProps<{ videos: Array<VideoResource>; loading?: boolean }>();
const autoplay = defineModel<boolean>("autoplay", { required: true });

const { dates, numbers } = useFormatter();
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-4">
      <h2 class="text-ui-text text-lg font-bold">À suivre</h2>

      <label class="text-ui-text-muted flex cursor-pointer items-center gap-2 text-sm select-none">
        Lecture automatique
        <button
          type="button"
          role="switch"
          :aria-checked="autoplay"
          class="relative h-5 w-9 rounded-full transition-colors"
          :class="autoplay ? 'bg-alt' : 'bg-ui-border'"
          @click="autoplay = !autoplay"
        >
          <span
            class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform"
            :class="{ 'translate-x-4': autoplay }"
          />
        </button>
      </label>
    </div>

    <ul v-if="loading" class="space-y-3" aria-hidden="true">
      <li v-for="i in 6" :key="i" class="grid grid-cols-[10.5rem_1fr] gap-3">
        <div class="shimmer bg-ui-border/40 aspect-video rounded-lg" />
        <div class="space-y-2 pt-1">
          <div class="shimmer bg-ui-border/40 h-3.5 w-full rounded" />
          <div class="shimmer bg-ui-border/40 h-3.5 w-2/3 rounded" />
          <div class="shimmer bg-ui-border/30 h-3 w-1/2 rounded" />
        </div>
      </li>
    </ul>

    <ul v-else-if="videos.length > 0" class="space-y-3">
      <li v-for="video in videos" :key="video.id">
        <NuxtLink
          :to="`/videos/${video.id}`"
          class="group hover:bg-ui-border/30 -m-1.5 grid grid-cols-[10.5rem_1fr] gap-3 rounded-xl p-1.5 transition-colors"
        >
          <div class="bg-ui-border/40 relative aspect-video overflow-hidden rounded-lg">
            <NuxtImg
              class="size-full object-cover"
              :class="{ 'opacity-60': video.viewing_progression > 0.9 }"
              loading="lazy"
              format="avif,webp"
              width="168"
              :src="video.thumbnail"
              alt=""
            />
            <span
              class="absolute right-1 bottom-1 rounded bg-black/75 px-1 text-[11px] font-semibold text-white tabular-nums"
            >
              {{ numbers.displaySeconds(video.duration) }}
            </span>
            <div
              v-if="video.viewing_progression > 0"
              class="absolute inset-x-0 bottom-0 h-0.5 bg-white/30"
            >
              <div
                class="bg-alt h-full"
                :style="{ width: `${Math.min(video.viewing_progression, 1) * 100}%` }"
              />
            </div>
          </div>

          <div class="min-w-0">
            <h3 class="text-ui-text line-clamp-2 text-sm leading-snug font-semibold">
              {{ video.title }}
            </h3>
            <p class="text-ui-text-muted mt-1 truncate text-xs">{{ video.author.name }}</p>
            <p class="text-ui-text-muted text-xs">{{ dates.ago(video.created_at) }}</p>
          </div>
        </NuxtLink>
      </li>
    </ul>

    <p v-else class="text-ui-text-muted py-6 text-center text-sm">
      Aucune autre vidéo de cette chaîne pour le moment.
    </p>
  </section>
</template>
