<script lang="ts" setup>
import { useVideosInProgress } from "~/composables/videos/useVideosInProgress";

const { data: videos, refresh } = await useVideosInProgress();
const { numbers } = useFormatter();

const featured = computed(() => videos.value?.items[0]);
const others = computed(() => videos.value?.items.slice(1) ?? []);

const remaining_minutes = computed(() => {
  if (!featured.value) {
    return 0;
  }

  return Math.max(
    1,
    Math.round((featured.value.duration * (1 - featured.value.viewing_progression)) / 60),
  );
});
</script>

<template>
  <div v-if="featured" class="space-y-8">
    <section
      class="video-tinted bg-ui-bg relative isolate grid items-center gap-5 overflow-hidden rounded-3xl p-3 shadow-[0_0_0_1px_var(--ui-border),0_30px_60px_-34px_rgb(var(--c)/0.55)] sm:p-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-8 md:p-5 dark:bg-[rgb(var(--c-dark)/0.3)] dark:shadow-[inset_0_0_0_1px_rgb(var(--c-light)/0.12),0_24px_50px_-30px_rgb(var(--c)/0.45)]"
      :style="video_tones_style(featured.palette)"
    >
      <div
        class="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        :style="{ backgroundImage: palette_light(featured.palette, 0.35) }"
      />

      <NuxtLink
        :to="`/videos/${featured.id}`"
        class="focus-visible:outline-alt relative block aspect-video overflow-hidden rounded-2xl"
      >
        <NuxtImg
          class="size-full object-cover"
          format="avif,webp"
          width="720"
          :src="featured.thumbnails.large"
          alt=""
        />
        <span
          class="absolute right-3 bottom-4 rounded-lg bg-[rgb(var(--c-dark)/0.8)] px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums"
        >
          {{ numbers.displaySeconds(featured.duration) }}
        </span>
        <div class="absolute inset-x-0 bottom-0 h-1 bg-white/25">
          <div
            class="h-full min-w-1.5 bg-[rgb(var(--c-vivid))]"
            :style="{ width: `${Math.min(featured.viewing_progression, 1) * 100}%` }"
          />
        </div>
      </NuxtLink>

      <div class="min-w-0 px-1 pb-1 md:px-0 md:pb-0">
        <p
          class="text-xs font-bold tracking-widest text-[rgb(var(--c-ink))] uppercase dark:text-[rgb(var(--c-light))]"
        >
          Reprendre la lecture
        </p>
        <h2 class="font-display text-ui-text mt-2 text-lg leading-snug font-medium md:text-xl">
          {{ featured.title }}
        </h2>

        <NuxtLink
          :to="`/subscriptions/${featured.author.slug}`"
          class="text-ui-text/80 hover:text-ui-text mt-3 inline-flex items-center gap-2.5 transition-colors"
        >
          <NuxtImg
            class="size-7 rounded-full object-cover"
            format="avif,webp"
            width="28"
            height="28"
            :src="featured.author.channel.logo"
            alt=""
          />
          <span>{{ featured.author.name }}</span>
        </NuxtLink>

        <div class="mt-5 flex flex-wrap items-center gap-4">
          <NuxtLink
            :to="`/videos/${featured.id}`"
            class="bg-ui-text text-background inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03]"
          >
            <Icon name="lucide:play" class="fill-current" />
            Reprendre
          </NuxtLink>
          <span class="text-ui-text/75 text-sm">{{ remaining_minutes }} min restantes</span>
        </div>
      </div>
    </section>

    <VideosRow
      v-if="others.length > 0"
      title="Aussi en cours"
      icon="lucide:history"
      :videos="others"
      @change="refresh"
    />
  </div>
</template>
