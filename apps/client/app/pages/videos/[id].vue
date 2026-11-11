<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";

import { useVideos } from "~/composables/videos/useVideos";

definePageMeta({ name: pages.videos_single });

const { t } = useI18n();
const route = useRoute();
const { dates, videos } = useFormatter();

const { data } = await useAppFetch<VideoResource>(`/api/videos/${route.params.id}`);

const { data: up_next, status: up_status } = useAppFetch(`/api/videos/${route.params.id}/next`);
const next_video = computed(() => (up_next.value ?? []).find((v) => v.viewing_progression <= 0.9));

const autoplay = useLocalStorage("watcher:autoplay", true);
const show_countdown = ref(false);

const player = useTemplateRef("player");
const sides = computed(() => palette_sides(data.value?.palette));

const theater = useCookie<boolean>("watcher-theater-mode", {
  default: () => false,
  maxAge: 3600 * 24 * 365,
});

usePageAmbient(
  () => data.value,
  () => theater.value,
);

useShortcut("theater", () => {
  theater.value = !theater.value;
});

const on_ended = () => {
  if (autoplay.value && next_video.value) {
    show_countdown.value = true;
  }
};

const play_next = async () => {
  show_countdown.value = false;

  if (next_video.value) {
    await navigateTo({ path: `/videos/${next_video.value.id}`, query: { autoplay: 1 } });
  }
};

usePageNavigation()(() => [
  {
    label: t("nav.videos"),
    icon: "lucide:clapperboard",
    to: "/videos",
  },
  {
    label: videos.filters.service(data.value?.author.channel.service),
    icon:
      data.value?.author.channel.service === "youtube" ? "fa7-brands:youtube" : "fa7-brands:twitch",
  },
  {
    label: data.value?.author.name ?? "",
    to: `/subscriptions/${data.value?.author.id}`,
  },
  {
    label: data.value?.title ?? "",
  },
]);

useMeta({
  title: () => data.value?.title ?? "",
  description: () =>
    data.value
      ? t("videos.watch_description", {
          title: data.value.title,
          author: data.value.author.name,
          date: dates.format(data.value.created_at),
        })
      : "",
});
</script>

<template>
  <div
    v-if="data"
    class="video-tinted mx-auto grid max-w-[1800px] gap-x-6 gap-y-4 pb-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:grid-rows-[auto_1fr]"
    :style="video_tones_style(data.palette)"
  >
    <div
      class="min-w-0 xl:col-start-1 xl:row-start-1"
      :class="{
        'bg-black shadow-[0_0_0_100vmax_black] [clip-path:inset(0_-100vmax)] xl:col-span-2':
          theater,
      }"
    >
      <div class="relative" :class="{ 'mx-auto max-w-[calc((100dvh-10rem)*16/9)]': theater }">
        <div
          class="pointer-events-none absolute -inset-x-[7%] -inset-y-[14%] hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent),linear-gradient(to_bottom,transparent,black_11%,black_89%,transparent)] [mask-composite:intersect] md:block"
          :class="{ 'md:hidden': theater }"
          :style="{ backgroundImage: palette_glow(data.palette, 0.45) }"
        />

        <template v-if="theater && sides">
          <div
            class="pointer-events-none absolute inset-y-0 right-full w-screen"
            :style="{ backgroundImage: sides.left }"
          />
          <div
            class="pointer-events-none absolute inset-y-0 left-full w-screen"
            :style="{ backgroundImage: sides.right }"
          />
        </template>

        <div
          class="relative aspect-video overflow-hidden bg-black"
          :class="theater ? [] : ['shadow-[0_0_0_1px_rgb(255_255_255/0.08)]', 'md:rounded-2xl']"
        >
          <LazyVideoPlayback
            ref="player"
            :video="data"
            :autoplay="route.query.autoplay === '1'"
            :theater="theater"
            @ended="on_ended"
            @toggle_theater="theater = !theater"
          />

          <VideoNextCountdown
            v-if="show_countdown && next_video"
            :video="next_video"
            @play="play_next"
            @cancel="show_countdown = false"
          />
        </div>
      </div>
    </div>

    <VideoMeta
      class="min-w-0 px-4 md:px-0 xl:col-start-1 xl:row-start-2"
      :video="data"
      @seek="player?.seek($event)"
    />

    <VideoUpNext
      v-model:autoplay="autoplay"
      class="mt-2 px-4 md:px-0 xl:col-start-2 xl:mt-0"
      :class="theater ? 'xl:row-start-2' : 'xl:row-span-2 xl:row-start-1'"
      :videos="up_next ?? []"
      :next-id="autoplay ? next_video?.id : undefined"
      :loading="up_status === 'pending'"
    />
  </div>
</template>
