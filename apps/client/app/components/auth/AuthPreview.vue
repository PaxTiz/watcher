<script lang="ts" setup>
// An abstract wall of videos from both platforms, standing for the app before the user has any data
const HUES = [
  ["#ff3b30", "#7a1020"],
  ["#9146ff", "#2a145c"],
  ["#fe640b", "#5c2205"],
  ["#1fb6a8", "#0b3c3a"],
  ["#e8b021", "#4f3a07"],
  ["#3b82f6", "#10295a"],
  ["#ec4899", "#4d1031"],
];
const DURATIONS = [
  "12:28",
  "1:10:54",
  "4:51:00",
  "38:51",
  "21:15",
  "3:40:00",
  "54:07",
  "17:26",
  "2:42:49",
];

const tiles = Array.from({ length: 18 }, (_, i) => {
  const [from, to] = HUES[(i * 5) % HUES.length]!;
  return {
    id: i,
    platform: i % 3 === 1 ? "twitch" : "youtube",
    duration: DURATIONS[i % DURATIONS.length],
    background: `radial-gradient(120% 90% at ${20 + ((i * 37) % 60)}% 20%, ${from} 0%, ${to} 70%, #0b0d14 100%)`,
    title: 55 + ((i * 17) % 40),
    progress: i % 4 === 0 ? 15 + ((i * 23) % 70) : 0,
  };
});

// Two copies of each column so the scroll loops seamlessly
const columns = [0, 1, 2].map((column) => {
  const items = tiles.filter((_, i) => i % 3 === column);
  return [...items, ...items];
});
</script>

<template>
  <div class="relative isolate overflow-hidden bg-[#0b0d14]" aria-hidden="true">
    <div class="absolute inset-0 [perspective:1600px]">
      <div
        class="absolute -inset-x-[15%] -inset-y-[25%] grid [transform:rotateX(22deg)_rotateZ(-9deg)] grid-cols-3 gap-5"
      >
        <div
          v-for="(column, index) in columns"
          :key="index"
          class="auth-preview-column flex flex-col gap-5 motion-reduce:!animate-none"
          :style="{
            animationDuration: `${70 + index * 18}s`,
            animationDirection: index === 1 ? 'reverse' : 'normal',
          }"
        >
          <div v-for="(tile, i) in column" :key="`${tile.id}-${i}`" class="space-y-2.5">
            <div
              class="relative aspect-video overflow-hidden rounded-2xl shadow-[0_0_0_1px_rgb(255_255_255/0.06)]"
              :style="{ background: tile.background }"
            >
              <Icon
                :name="tile.platform === 'youtube' ? 'fa7-brands:youtube' : 'fa7-brands:twitch'"
                class="absolute top-3 left-3 text-lg text-white/80"
              />
              <span
                class="absolute right-2.5 bottom-2.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums"
              >
                {{ tile.duration }}
              </span>
              <span v-if="tile.progress" class="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                <span class="bg-alt block h-full" :style="{ width: `${tile.progress}%` }" />
              </span>
            </div>
            <div class="flex gap-2.5">
              <span class="size-7 shrink-0 rounded-full bg-white/10" />
              <div class="flex-1 space-y-1.5 pt-0.5">
                <span
                  class="block h-2.5 rounded-full bg-white/15"
                  :style="{ width: `${tile.title}%` }"
                />
                <span class="block h-2 w-2/5 rounded-full bg-white/[0.08]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fades so the wall melts into the frame -->
    <div
      class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#0b0d14_0%,transparent_22%,transparent_70%,#0b0d14_100%)]"
    />

    <div
      class="liquid-glass liquid-glass-dense absolute inset-x-6 bottom-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white"
    >
      <span class="flex -space-x-1.5">
        <span
          class="flex size-7 items-center justify-center rounded-full bg-[#ff0033] ring-2 ring-[#14161f]"
        >
          <Icon name="fa7-brands:youtube" class="text-[13px]" />
        </span>
        <span
          class="flex size-7 items-center justify-center rounded-full bg-[#9146ff] ring-2 ring-[#14161f]"
        >
          <Icon name="fa7-brands:twitch" class="text-[13px]" />
        </span>
      </span>
      <span>
        <span class="font-medium">Un seul fil</span>
        <span class="text-white/60"> · toutes vos chaînes, dans l'ordre de leur sortie</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.auth-preview-column {
  animation: auth-preview-scroll linear infinite;
}

@keyframes auth-preview-scroll {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50%);
  }
}
</style>
