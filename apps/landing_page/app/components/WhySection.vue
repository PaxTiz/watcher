<script lang="ts" setup>
import type { Platform } from "~/utils/preview";

const { t } = useI18n();

const SOURCES: Array<{ key: string; platform: Platform; who?: string; offset: number }> = [
  { key: "live", platform: "twitch", who: "Nova Kestrel", offset: 0 },
  { key: "ice", platform: "youtube", who: "Studio Brume", offset: 16 },
  { key: "synth", platform: "youtube", who: "Oto Maru", offset: 6 },
  { key: "rediff", platform: "youtube", who: "Nova Kestrel Rediffs", offset: 22 },
  { key: "recommended", platform: "youtube", offset: 10 },
  { key: "game", platform: "twitch", who: "Théo Barral", offset: 0 },
];

const FEED = [VIDEOS.live, VIDEOS.ice, VIDEOS.synth, VIDEOS.rediff].map((video) => ({
  ...video,
  favorite: video.creator !== "nova" || video.live,
}));

const CURVES = [28, 96.8, 165.6, 234.4, 303.2, 372];
</script>

<template>
  <section id="why" aria-labelledby="why-title" class="flex flex-col gap-12">
    <SectionHeading id="why-title" number="01" :label="t('why.label')" :title="t('why.title')" />

    <div
      class="bg-background border-ui-border grid gap-7 rounded-3xl border p-[clamp(20px,3.4vw,48px)] min-[960px]:grid-cols-[minmax(0,1fr)_120px_minmax(0,1.2fr)] min-[960px]:gap-x-0"
    >
      <div class="flex flex-col gap-2 min-[960px]:[grid-area:1/1]">
        <span class="eyebrow text-ui-text-muted">{{ t("why.problem_label") }}</span>
        <span class="text-ui-text text-[19px] leading-[1.35] font-semibold text-balance">
          {{ t("why.problem") }}
        </span>
      </div>
      <div class="flex flex-col gap-2 min-[960px]:[grid-area:1/3]">
        <span class="eyebrow text-alt-text">{{ t("why.solution_label") }}</span>
        <span class="text-ui-text text-[19px] leading-[1.35] font-semibold text-balance">
          {{ t("why.solution") }}
        </span>
      </div>

      <ul
        class="m-0 flex list-none flex-col gap-2.5 p-0 min-[960px]:h-[400px] min-[960px]:justify-between min-[960px]:gap-0 min-[960px]:[grid-area:2/1]"
      >
        <li
          v-for="source in SOURCES"
          :key="source.key"
          class="bg-ui-bg border-ui-border box-border grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3.5 min-[960px]:ml-[var(--offset)]"
          :style="{ '--offset': `${source.offset}px` }"
        >
          <PlatformDot :platform="source.platform" />
          <div class="min-w-0">
            <p class="text-ui-text truncate text-[13px] font-semibold">
              {{ source.who ?? t("why.recommended") }}
            </p>
            <p class="text-ui-text-muted truncate text-[13px]">
              {{ t(`why.sources.${source.key}.what`) }}
            </p>
          </div>
          <span class="text-ui-text-muted text-xs tabular-nums">
            {{ t(`why.sources.${source.key}.ago`) }}
          </span>
        </li>
      </ul>

      <div
        aria-hidden="true"
        class="relative hidden h-[400px] min-[960px]:block min-[960px]:[grid-area:2/2]"
      >
        <svg
          viewBox="0 0 100 400"
          preserveAspectRatio="none"
          class="absolute inset-0 size-full overflow-visible"
        >
          <defs>
            <linearGradient
              id="why-line"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="100"
              y2="0"
            >
              <stop offset="0" stop-color="#c4c9d8" />
              <stop offset="1" stop-color="#fe640b" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#why-line)" stroke-width="1.5">
            <path
              v-for="y in CURVES"
              :key="y"
              vector-effect="non-scaling-stroke"
              :d="`M0 ${y} C55 ${y} 45 200 100 200`"
            />
          </g>
        </svg>
        <span class="bg-alt absolute top-[calc(50%-4px)] -right-1 size-2 rounded-full" />
      </div>

      <div
        role="img"
        :aria-label="t('why.feed_label')"
        class="bg-ui-bg border-ui-border box-border flex min-h-[400px] flex-col gap-1.5 overflow-hidden rounded-2xl border p-3.5 shadow-[0_1px_2px_rgba(18,21,33,0.05)] min-[960px]:h-[400px] min-[960px]:[grid-area:2/3]"
      >
        <div class="flex items-center justify-between px-2 pt-1 pb-2.5">
          <span class="text-ui-text flex items-center gap-2 text-sm font-bold">
            <svg width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">
              <path
                d="M50 0C88 0 100 12 100 50C100 88 88 100 50 100C12 100 0 88 0 50C0 12 12 0 50 0Z"
                fill="#fe640b"
              />
              <path
                d="M37 29L37 71L73 50Z"
                fill="#111114"
                stroke="#111114"
                stroke-width="12"
                stroke-linejoin="round"
              />
            </svg>
            {{ t("preview.favorites_new") }}
          </span>
          <span class="text-ui-text-muted text-xs">{{ t("preview.see_all") }}</span>
        </div>
        <div
          v-for="video in FEED"
          :key="video.key"
          class="box-border grid h-[76px] shrink-0 grid-cols-[112px_minmax(0,1fr)] items-center gap-3.5 rounded-xl p-1.5"
          :class="{ 'bg-alt/[0.08]': video.live }"
        >
          <VideoThumb :video="video" small />
          <div class="flex min-w-0 flex-col gap-1">
            <p class="text-ui-text line-clamp-2 text-sm leading-[1.3] font-semibold">
              {{ t(`videos.items.${video.key}.title`) }}
            </p>
            <p class="text-ui-text-muted flex items-center gap-1.5 text-xs">
              <span v-if="video.favorite" class="text-highlight">★</span>
              <PlatformDot :platform="video.platform" />
              <span class="truncate">
                {{ CREATORS[video.creator].name }} ·
                {{ video.live ? t("videos.live_now") : t(`videos.items.${video.key}.when`) }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
