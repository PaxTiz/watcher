<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <SectionIntro
    id="feed"
    :title="t('feed.title')"
    :soft="t('feed.titleSoft')"
    :lead="t('feed.lead')"
  >
    <div
      class="bg-ui-bg mt-10 rounded-[22px] p-[clamp(18px,3vw,32px)] shadow-[0_0_0_1px_var(--ui-border)]"
    >
      <p
        class="text-ui-text-muted mx-2.5 mt-1.5 mb-2 text-xs font-medium tracking-[0.06em] uppercase"
      >
        {{ t("feed.today") }}
      </p>
      <ul class="grid gap-1">
        <li
          v-for="video in PREVIEW_VIDEOS.slice(0, 5)"
          :key="video.key"
          class="hover:bg-ui-text/[0.03] grid grid-cols-[110px_minmax(0,1fr)] items-center gap-4.5 rounded-[14px] p-2.5 sm:grid-cols-[54px_140px_minmax(0,1fr)_auto]"
        >
          <time class="text-ui-text-muted hidden font-mono text-[13px] sm:block">{{
            video.time
          }}</time>
          <PreviewThumb :video="video" />
          <div class="min-w-0">
            <p class="text-ui-text text-[15px] leading-snug font-medium">
              {{ t(`videos.${video.key}`) }}
            </p>
            <p class="text-ui-text-muted mt-1 flex items-center gap-1.5 text-[13px]">
              <Icon
                :name="video.platform === 'youtube' ? 'fa7-brands:youtube' : 'fa7-brands:twitch'"
              />
              {{ video.channel }}
            </p>
          </div>
          <span
            v-if="video.tag"
            class="hidden text-xs sm:block"
            :class="video.tag === 'new' ? 'text-alt' : 'text-ui-text-muted'"
          >
            {{ t(`videos.tags.${video.tag}`) }}
          </span>
        </li>
      </ul>
    </div>
  </SectionIntro>
</template>
