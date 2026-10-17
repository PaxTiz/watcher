<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";

const COUNTDOWN_SECONDS = 8;

const { video } = defineProps<{ video: VideoResource }>();
const emit = defineEmits<{ play: []; cancel: [] }>();

const remaining = ref(COUNTDOWN_SECONDS);

const { pause } = useIntervalFn(() => {
  remaining.value--;

  if (remaining.value <= 0) {
    pause();
    emit("play");
  }
}, 1000);

const cancel = () => {
  pause();
  emit("cancel");
};
</script>

<template>
  <div
    class="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    role="dialog"
    aria-label="Vidéo suivante"
  >
    <div class="w-full max-w-sm text-white">
      <p class="text-sm text-white/70">Vidéo suivante dans {{ remaining }} s</p>

      <div class="mt-3 grid grid-cols-[8rem_1fr] gap-3">
        <NuxtImg
          class="aspect-video w-full rounded-lg object-cover"
          format="avif,webp"
          width="128"
          :src="video.thumbnail"
          alt=""
        />
        <div class="font-content min-w-0">
          <p class="line-clamp-2 leading-snug font-semibold">{{ video.title }}</p>
          <p class="mt-1 truncate text-sm text-white/70">{{ video.author.name }}</p>
        </div>
      </div>

      <div class="mt-4 h-1 overflow-hidden rounded-full bg-white/20">
        <div
          class="bg-alt h-full transition-[width] duration-1000 ease-linear"
          :style="{ width: `${((COUNTDOWN_SECONDS - remaining) / COUNTDOWN_SECONDS) * 100}%` }"
        />
      </div>

      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class="flex-1 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/25"
          @click="cancel"
        >
          Annuler
        </button>
        <button
          type="button"
          class="bg-alt flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          @click="emit('play')"
        >
          Lire maintenant
        </button>
      </div>
    </div>
  </div>
</template>
