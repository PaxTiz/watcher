<script lang="ts" setup>
const { t } = useI18n();

const playing = PREVIEW_VIDEOS[3]!;
const upNext = [PREVIEW_VIDEOS[1]!, PREVIEW_VIDEOS[5]!, PREVIEW_VIDEOS[2]!];
</script>

<template>
  <SectionIntro
    id="player"
    :title="t('player.title')"
    :soft="t('player.titleSoft')"
    :lead="t('player.lead')"
  >
    <div
      class="mt-10 grid gap-5 rounded-[22px] bg-[var(--frame)] p-[clamp(18px,3vw,32px)] text-[#e8e8ea] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]"
      aria-hidden="true"
    >
      <div class="relative self-start">
        <PreviewThumb :video="playing" :show-duration="false" class="rounded-[14px]" />
        <span
          class="absolute top-3 left-3 rounded-full bg-[rgb(12_12_14/0.6)] px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
        >
          {{ t("player.resumedAt", { time: "1:47:12" }) }}
        </span>
        <div
          class="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-full bg-white/[0.12] px-3.5 py-2 text-xs font-medium text-white tabular-nums shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15)] backdrop-blur-md"
        >
          <Icon name="lucide:play" class="fill-current" />
          <span class="h-[3px] flex-1 rounded-full bg-white/30"
            ><span class="bg-alt block h-full w-[45%] rounded-full"
          /></span>
          1:47:12 / 3:58:40
        </div>
      </div>

      <div>
        <p class="mb-3 flex justify-between text-sm font-medium text-white">
          {{ t("player.upNext") }}
          <span class="text-xs font-normal text-[#8b8b92]">{{ t("player.autoplay") }}</span>
        </p>
        <div
          v-for="(video, index) in upNext"
          :key="video.key"
          class="mt-1 grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3 rounded-xl p-1.5"
          :class="{ 'bg-white/[0.07]': index === 0 }"
        >
          <PreviewThumb :video="video" />
          <div class="min-w-0">
            <p v-if="index === 0" class="text-alt mb-0.5 text-[10px] tracking-[0.08em] uppercase">
              {{ t("player.next") }}
            </p>
            <p class="font-content text-[13px] leading-snug font-medium">
              {{ t(`videos.${video.key}`) }}
            </p>
            <p class="mt-0.5 text-[11.5px] text-[#8b8b92]">{{ video.channel }}</p>
          </div>
        </div>
      </div>
    </div>
  </SectionIntro>
</template>
