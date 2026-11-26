<script lang="ts" setup>
const { t } = useI18n();

const QUEUE = [VIDEOS.ice, VIDEOS.game, VIDEOS.synth];
const FAVORITES = [VIDEOS.ice, VIDEOS.synth];

const MOCK =
  "bg-background border-ui-border box-border flex aspect-[16/10] flex-col overflow-hidden rounded-2xl border p-[clamp(14px,2vw,24px)] shadow-[0_1px_2px_rgba(18,21,33,0.06),0_28px_50px_-34px_rgba(18,21,33,0.4)]";
</script>

<template>
  <section id="features" aria-labelledby="features-title" class="flex flex-col gap-10">
    <SectionHeading
      id="features-title"
      number="02"
      :label="t('features.label')"
      :title="t('features.title')"
    />

    <div class="grid gap-4 min-[960px]:grid-cols-12">
      <article
        class="bg-ui-bg border-ui-border grid items-center gap-[clamp(24px,4vw,56px)] rounded-3xl border p-[clamp(20px,2.8vw,40px)] min-[960px]:col-span-12 min-[960px]:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]"
      >
        <div class="flex max-w-[520px] flex-col gap-3.5">
          <span class="eyebrow text-alt-text">{{ t("features.player.label") }}</span>
          <h3
            class="font-display text-ui-text m-0 text-[clamp(22px,2.4vw,30px)] leading-[1.2] font-medium tracking-[-0.02em] text-balance"
          >
            {{ t("features.player.title") }}
          </h3>
          <p class="text-ui-text-muted m-0 text-[17px] leading-[1.6] text-pretty">
            {{ t("features.player.text") }}
          </p>
        </div>

        <div role="img" :aria-label="t('features.player.preview_label')" :class="[MOCK, 'gap-3']">
          <div
            class="liquid-glass liquid-glass-dense text-ui-text-muted flex h-[30px] items-center gap-2 self-start rounded-full px-3.5 text-xs whitespace-nowrap"
            aria-hidden="true"
          >
            <span>{{ t("preview.home") }}</span>
            <span>›</span>
            <span>Twitch</span>
            <span>›</span>
            <span class="text-ui-text font-semibold">Nova Kestrel</span>
          </div>
          <div
            class="grid min-h-0 gap-3.5 sm:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"
            aria-hidden="true"
          >
            <div class="flex min-w-0 flex-col gap-2.5">
              <div
                class="relative aspect-video overflow-hidden rounded-xl"
                :style="{ background: SCENES.paint }"
              >
                <span
                  class="bg-alt absolute top-3 left-3 flex h-6 items-center gap-1.5 rounded-md px-[9px] text-[11px] font-bold tracking-[0.05em] text-[#121521]"
                >
                  <span class="size-1.5 rounded-full bg-[#121521]" />
                  {{ t("preview.live") }}
                </span>
                <div
                  class="liquid-glass absolute inset-x-3 bottom-3 flex h-[34px] items-center gap-3 rounded-xl px-3 [--glass-fill:rgb(8_9_12/0.55)] [--glass-glow:rgb(255_255_255/0.04)] [--glass-rim-low:rgb(255_255_255/0.12)] [--glass-rim:rgb(255_255_255/0.35)] [--glass-shadow:0_0_0_1px_rgb(255_255_255/0.06)]"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2 1l9 5-9 5z" fill="#fff" />
                  </svg>
                  <span class="bg-alt h-[3px] flex-1 rounded-sm" />
                  <span class="text-[11px] font-medium text-white tabular-nums">
                    {{ t("preview.viewers", { count: "1 284" }) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2.5">
                <CreatorAvatar
                  :initials="CREATORS.nova.initials"
                  :color="CREATORS.nova.color"
                  :size="34"
                />
                <div class="flex min-w-0 flex-col gap-0.5">
                  <p class="text-ui-text truncate text-[15px] font-semibold">
                    {{ t("videos.items.live.title") }}
                  </p>
                  <p class="text-ui-text-muted text-xs">Nova Kestrel · Twitch</p>
                </div>
              </div>
            </div>

            <div class="hidden min-w-0 flex-col gap-2.5 sm:flex">
              <div class="flex items-center justify-between gap-2">
                <span class="text-ui-text text-sm font-bold">{{ t("preview.up_next") }}</span>
                <span
                  class="text-ui-text-muted flex items-center gap-1.5 text-[11px] whitespace-nowrap"
                >
                  {{ t("preview.autoplay") }}
                  <span class="bg-alt relative h-3.5 w-6 rounded-full">
                    <span class="absolute top-0.5 right-0.5 size-2.5 rounded-full bg-white" />
                  </span>
                </span>
              </div>
              <div
                v-for="video in QUEUE"
                :key="video.key"
                class="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-2.5"
              >
                <VideoThumb :video="video" small />
                <div class="flex min-w-0 flex-col gap-[3px]">
                  <p class="text-ui-text line-clamp-2 text-xs leading-[1.3] font-semibold">
                    {{ t(`videos.items.${video.key}.title`) }}
                  </p>
                  <p class="text-ui-text-muted flex items-center gap-[5px] text-[11px]">
                    <PlatformDot :platform="video.platform" />
                    <span class="truncate">{{ CREATORS[video.creator].name }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article
        class="bg-ui-bg border-ui-border flex flex-col justify-between gap-7 rounded-3xl border p-[clamp(20px,2.4vw,32px)] min-[960px]:col-span-7"
      >
        <div class="flex max-w-[520px] flex-col gap-3.5">
          <span class="eyebrow text-alt-text">{{ t("features.favorites.label") }}</span>
          <h3
            class="font-display text-ui-text m-0 text-[clamp(22px,2.4vw,30px)] leading-[1.2] font-medium tracking-[-0.02em] text-balance"
          >
            {{ t("features.favorites.title") }}
          </h3>
          <p class="text-ui-text-muted m-0 text-[17px] leading-[1.6] text-pretty">
            {{ t("features.favorites.text") }}
          </p>
        </div>

        <div
          role="img"
          :aria-label="t('features.favorites.preview_label')"
          :class="[MOCK, 'gap-3.5']"
        >
          <div class="flex items-baseline gap-2.5" aria-hidden="true">
            <span class="text-ui-text text-base font-bold">
              <span class="text-highlight">★</span>&nbsp;{{ t("preview.favorites_new") }}
            </span>
            <span class="text-ui-text-muted text-xs">{{ t("preview.see_all") }}</span>
          </div>
          <div class="grid grid-cols-2 gap-3.5" aria-hidden="true">
            <VideoCard v-for="video in FAVORITES" :key="video.key" :video="video" />
          </div>
          <span class="text-ui-text mt-2 text-base font-bold" aria-hidden="true">
            {{ t("preview.yesterday") }}
          </span>
        </div>
      </article>

      <article
        class="bg-alt flex min-h-[300px] flex-col justify-end gap-7 overflow-hidden rounded-3xl p-[clamp(20px,2.4vw,32px)] text-[#121521] min-[960px]:col-span-5"
      >
        <div class="flex flex-col gap-3.5">
          <h3
            class="font-display m-0 text-[clamp(26px,2.8vw,40px)] leading-[1.08] font-medium tracking-[-0.03em] text-balance"
          >
            {{ t("features.no_reco.title") }}
          </h3>
          <p class="m-0 max-w-[380px] text-base leading-[1.55] text-pretty">
            {{ t("features.no_reco.text") }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
