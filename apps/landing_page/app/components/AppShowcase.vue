<script lang="ts" setup>
const { t } = useI18n();

const selected = ref(4);
const resumed = computed(() => PREVIEW_VIDEOS[selected.value % PREVIEW_VIDEOS.length]!);
const latest = PREVIEW_VIDEOS.slice(0, 4);
</script>

<template>
  <div
    class="grid grid-cols-1 gap-2 rounded-[22px] bg-[var(--frame)] p-2 shadow-[0_50px_80px_-40px_rgb(0_0_0/0.45),0_0_0_1px_rgb(0_0_0/0.08)] md:grid-cols-[220px_minmax(0,1fr)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]"
    role="img"
    :aria-label="t('showcase.label')"
  >
    <div class="dark hidden flex-col gap-0.5 px-2 py-2.5 text-[13px] md:flex" aria-hidden="true">
      <span
        class="font-display mx-1.5 mt-1 mb-3.5 flex items-center gap-2 text-[13px] font-medium text-white"
      >
        <span class="bg-alt grid size-[22px] place-items-center rounded-md text-[13px] text-black"
          >W</span
        >
        Watcher
      </span>
      <span
        class="mb-2 flex h-8 items-center gap-2 rounded-lg bg-white/[0.07] px-2.5 text-[12.5px] text-[#8b8b92]"
      >
        <Icon name="lucide:search" />
        {{ t("showcase.search") }}
      </span>
      <span class="flex items-center gap-2.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-white">
        <Icon name="lucide:house" class="text-alt" />
        {{ t("showcase.home") }}
      </span>
      <span class="flex items-center gap-2.5 px-2.5 py-1.5 text-[#9d9da4]">
        <Icon name="lucide:clapperboard" />
        {{ t("showcase.videos") }}
      </span>
      <span class="flex items-center gap-2.5 px-2.5 py-1.5 text-[#9d9da4]">
        <Icon name="lucide:star" />
        {{ t("showcase.favorites") }}
      </span>
      <span class="mx-2.5 mt-3.5 mb-1 text-[10px] tracking-[0.08em] text-[#6c6c73] uppercase">
        {{ t("showcase.subscriptions") }}
      </span>
      <button
        v-for="(channel, index) in PREVIEW_CHANNELS"
        :key="channel"
        type="button"
        tabindex="-1"
        class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1 text-left text-[12.5px] text-[#d6d6da] transition-colors hover:bg-white/[0.06]"
        :class="{ 'bg-white/10 text-white': selected === index }"
        @click="selected = index"
      >
        <span
          class="grid size-5 shrink-0 place-items-center rounded-full bg-[#3a3a40] text-[9px] font-semibold text-[#d0d0d5]"
        >
          {{ initials(channel) }}
        </span>
        <span class="flex-1 truncate">{{ channel }}</span>
        <span v-if="index < 2" class="bg-alt size-1.5 rounded-full" />
      </button>
    </div>

    <div
      class="bg-ui-bg relative min-w-0 overflow-hidden rounded-2xl px-4 pt-4 pb-20 md:px-5.5"
      aria-hidden="true"
    >
      <span
        class="text-ui-text-muted inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12.5px] shadow-[inset_0_0_0_1px_var(--ui-border)]"
      >
        <Icon name="lucide:house" />
        {{ t("showcase.home") }}
      </span>
      <p class="font-display text-ui-text mt-4 mb-3.5 text-[22px] font-medium tracking-[-0.02em]">
        {{ t("showcase.greeting") }}
      </p>

      <div
        class="grid items-center gap-5 rounded-2xl p-2.5 shadow-[inset_0_0_0_1px_var(--ui-border)] sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
      >
        <PreviewThumb :key="resumed.key" :video="resumed" :progress="38" />
        <div class="min-w-0">
          <p class="text-ui-text-muted text-[10.5px] font-semibold tracking-[0.1em] uppercase">
            {{ t("showcase.resume") }}
          </p>
          <p class="text-ui-text mt-1.5 text-[17px] leading-tight font-medium">
            {{ t(`videos.${resumed.key}`) }}
          </p>
          <p class="text-ui-text-muted mt-2.5 flex items-center gap-2 text-[12.5px]">
            <span class="bg-ui-border size-5 rounded-full" />
            {{ resumed.channel }}
          </p>
          <p class="text-ui-text-muted mt-3.5 flex items-center gap-3 text-xs">
            <span
              class="bg-ui-text text-background inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium"
            >
              <Icon name="lucide:play" class="fill-current" />
              {{ t("showcase.resumeAction") }}
            </span>
            {{ t("showcase.remaining") }}
          </p>
        </div>
      </div>

      <p class="text-ui-text mt-5.5 mb-3 text-[13px] font-medium">{{ t("showcase.latest") }}</p>
      <div class="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <div v-for="video in latest" :key="video.key">
          <PreviewThumb :video="video" />
          <p class="text-ui-text mt-2 line-clamp-2 text-[12.5px] leading-snug font-medium">
            {{ t(`videos.${video.key}`) }}
          </p>
          <p class="text-ui-text-muted mt-0.5 flex items-center gap-1.5 text-[11.5px]">
            <Icon
              :name="video.platform === 'youtube' ? 'fa7-brands:youtube' : 'fa7-brands:twitch'"
            />
            {{ video.channel }}
          </p>
        </div>
      </div>

      <div
        class="bg-ui-bg/80 text-ui-text-muted absolute bottom-4 left-1/2 flex h-[42px] w-[min(420px,80%)] -translate-x-1/2 items-center gap-2.5 rounded-full pr-2 pl-3.5 text-[13px] shadow-[0_0_0_1px_var(--ui-border),0_10px_30px_-10px_rgb(0_0_0/0.2)] backdrop-blur-md"
      >
        <Icon name="lucide:search" />
        {{ t("showcase.searchCapsule") }}
        <kbd
          class="bg-background text-ui-text-muted ml-auto rounded-md px-1.5 py-0.5 font-mono text-[11px]"
          >⌘ K</kbd
        >
      </div>
    </div>
  </div>
</template>
