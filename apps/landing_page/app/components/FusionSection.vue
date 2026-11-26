<script lang="ts" setup>
const { t } = useI18n();

const merged = ref(false);

const SPLIT = [
  { name: "Nova Kestrel", platform: "twitch", initials: "NK", color: "#6d4fd6", tag: "live" },
  {
    name: "Nova Kestrel Rediffs",
    platform: "youtube",
    initials: "NR",
    color: "#3f6fb5",
    tag: "videos",
  },
  {
    name: "Nova Kestrel Clips",
    platform: "youtube",
    initials: "NC",
    color: "#b5561a",
    tag: "clips",
  },
] as const;

const CHANNELS = [
  { platform: "twitch", key: "twitch" },
  { platform: "youtube", key: "rediffs" },
  { platform: "youtube", key: "clips" },
] as const;

const MERGED_VIDEOS = [VIDEOS.live, VIDEOS.rediff, VIDEOS.clip].map((video, index) => ({
  ...video,
  channel: CHANNELS[index]!.key,
}));

const SEGMENT =
  "h-10 cursor-pointer rounded-full border-none px-5 text-[15px] font-semibold transition-colors";
</script>

<template>
  <section
    id="fusion"
    aria-labelledby="fusion-title"
    class="dark bg-frame text-ui-text relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-center gap-10 overflow-hidden rounded-3xl border border-[var(--panel-edge)] p-[clamp(28px,5vw,64px)]"
  >
    <div class="flex flex-col gap-3.5">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-ui-text-muted text-[13px] font-semibold tracking-[0.04em]">
          <span class="text-alt">03</span>&nbsp;&nbsp;{{ t("fusion.label") }}
        </span>
        <span
          class="bg-highlight rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.06em] text-[#121521] uppercase"
        >
          {{ t("fusion.soon") }}
        </span>
      </div>
      <h2
        id="fusion-title"
        class="section-title text-[clamp(28px,3.6vw,48px)] leading-[1.1] tracking-[-0.025em]"
      >
        {{ t("fusion.title") }}
      </h2>
      <p class="text-ui-text-muted m-0 max-w-[460px] text-[17px] leading-[1.55] text-pretty">
        {{ t("fusion.text") }}
      </p>
      <div
        role="group"
        :aria-label="t('fusion.toggle_label')"
        class="liquid-glass mt-2.5 flex gap-0.5 self-start rounded-full p-1"
      >
        <button
          type="button"
          :aria-pressed="!merged"
          :class="[
            SEGMENT,
            merged ? 'text-ui-text-muted bg-transparent' : 'bg-ui-text text-background',
          ]"
          @click="merged = false"
        >
          {{ t("fusion.split") }}
        </button>
        <button
          type="button"
          :aria-pressed="merged"
          :class="[
            SEGMENT,
            merged ? 'bg-ui-text text-background' : 'text-ui-text-muted bg-transparent',
          ]"
          @click="merged = true"
        >
          {{ t("fusion.merged") }}
        </button>
      </div>
    </div>

    <div
      class="bg-ui-bg border-ui-border flex min-h-[400px] flex-col gap-4 rounded-2xl border p-4.5 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.7)]"
    >
      <div class="text-ui-text-muted flex items-center justify-between text-[13px]">
        <span class="font-semibold">{{ t("fusion.subscriptions") }}</span>
        <span>{{ merged ? t("fusion.count_merged") : t("fusion.count_split") }}</span>
      </div>

      <div v-if="!merged" class="flex flex-col gap-2.5">
        <div
          v-for="row in SPLIT"
          :key="row.name"
          class="bg-ui-text/5 flex items-center gap-3.5 rounded-xl px-3.5 py-3"
        >
          <CreatorAvatar :initials="row.initials" :color="row.color" :size="42">
            <span
              class="border-ui-bg absolute -right-[3px] -bottom-[3px] box-border size-4 rounded-[5px] border-2"
              :style="{ background: PLATFORM_COLORS[row.platform] }"
            />
          </CreatorAvatar>
          <div class="min-w-0 flex-1">
            <p class="text-ui-text text-[15px] font-semibold">{{ row.name }}</p>
            <p class="text-ui-text-muted text-[13px]">
              {{ row.platform === "twitch" ? "Twitch" : "YouTube" }}
            </p>
          </div>
          <span
            v-if="row.tag === 'live'"
            class="rounded-md bg-[#9146ff] px-2 py-[3px] text-[11px] font-bold text-white"
          >
            LIVE
          </span>
          <span v-else class="text-ui-text-muted text-xs">{{ t(`fusion.tags.${row.tag}`) }}</span>
        </div>
        <span class="text-ui-text-muted px-1 pt-1.5 text-[13px] leading-normal">
          {{ t("fusion.split_note") }}
        </span>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div class="bg-ui-text/5 border-ui-border flex items-center gap-4 rounded-xl border p-4">
          <CreatorAvatar initials="NK" color="#6d4fd6" :size="56">
            <span
              class="border-ui-bg absolute -right-[3px] -bottom-[3px] box-border size-[18px] rounded-md border-[3px] bg-[#9146ff]"
            />
            <span
              class="border-ui-bg absolute -bottom-[3px] -left-[3px] box-border size-[18px] rounded-md border-[3px] bg-[#ff0033]"
            />
          </CreatorAvatar>
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <p class="font-display text-ui-text text-xl font-medium tracking-[-0.015em]">
              Nova Kestrel
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="channel in CHANNELS"
                :key="channel.key"
                class="bg-ui-text/[0.09] text-ui-text flex items-center gap-1.5 rounded-full px-[9px] py-[3px] text-xs"
              >
                <PlatformDot :platform="channel.platform" />
                {{ t(`fusion.channels.${channel.key}`) }}
              </span>
            </div>
          </div>
        </div>
        <span class="text-ui-text-muted text-[13px] font-semibold">{{
          t("fusion.all_in_one")
        }}</span>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="video in MERGED_VIDEOS" :key="video.key" class="flex min-w-0 flex-col gap-2">
            <VideoThumb :video="video" small />
            <p class="text-ui-text line-clamp-2 text-xs leading-[1.3] font-semibold">
              {{ t(`videos.items.${video.key}.title`) }}
            </p>
            <p class="text-ui-text-muted flex items-center gap-[5px] text-[11px]">
              <PlatformDot :platform="video.platform" />
              <span class="truncate">{{ t(`fusion.video_channels.${video.channel}`) }}</span>
            </p>
          </div>
        </div>
      </div>

      <div
        class="mt-auto flex items-start gap-2.5 rounded-xl border border-[color-mix(in_oklab,var(--color-highlight)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-highlight)_12%,transparent)] px-3.5 py-3"
      >
        <span aria-hidden="true" class="bg-highlight mt-[5px] size-2 shrink-0 rounded-full" />
        <span class="text-ui-text text-[13px] leading-normal">
          <strong class="font-bold">{{ t("fusion.notice_title") }}</strong>
          {{ t("fusion.notice") }}
          <a href="#roadmap" class="text-alt font-semibold hover:underline">{{
            t("fusion.notice_link")
          }}</a>
        </span>
      </div>
    </div>
  </section>
</template>
