<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";

import { useVideos } from "~/composables/videos/useVideos";

definePageMeta({ name: pages.videos_single });

const route = useRoute();
const { dates, videos } = useFormatter();

const { data } = await useAppFetch<VideoResource>(`/api/videos/${route.params.id}`);

const { data: channel_videos, status: channel_videos_status } = useVideos(
  computed(() => ({
    page: 1,
    per_page: 13,
    subscription_id: data.value?.author.id,
  })),
  { key: `videos_up_next_${route.params.id}`, lazy: true, server: false },
);

const up_next = computed(() => {
  return (channel_videos.value?.items ?? []).filter((v) => v.id !== data.value?.id).slice(0, 12);
});

const next_video = computed(() => up_next.value.find((v) => v.viewing_progression <= 0.9));

usePageAmbient(() => data.value);

const autoplay = useLocalStorage("watcher:autoplay", true);
const show_countdown = ref(false);

const player = useTemplateRef("player");

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
    label: "Vidéos",
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
      ? `Regarder la vidéo ${data.value.title} de ${data.value.author.name}, publiée le ${dates.format(data.value.created_at)}.`
      : "",
});
</script>

<template>
  <div
    v-if="data"
    class="video-tinted mx-auto grid max-w-[1800px] gap-6 pb-8 xl:grid-cols-[minmax(0,1fr)_24rem]"
    :style="video_tones_style(data.palette)"
  >
    <div class="min-w-0">
      <div class="relative">
        <div
          class="pointer-events-none absolute -inset-x-[7%] -inset-y-[14%] hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent),linear-gradient(to_bottom,transparent,black_11%,black_89%,transparent)] [mask-composite:intersect] md:block"
          :style="{ backgroundImage: palette_glow(data.palette, 0.45) }"
        />

        <div
          class="relative overflow-hidden bg-black shadow-[0_0_0_1px_rgb(255_255_255/0.08)] md:rounded-2xl"
        >
          <VideoPlayer
            ref="player"
            :video="data"
            :autoplay="route.query.autoplay === '1'"
            @ended="on_ended"
          />

          <VideoNextCountdown
            v-if="show_countdown && next_video"
            :video="next_video"
            @play="play_next"
            @cancel="show_countdown = false"
          />
        </div>
      </div>

      <VideoMeta class="mt-4 px-4 md:px-0" :video="data" @seek="player?.seek($event)" />
    </div>

    <VideoUpNext
      v-model:autoplay="autoplay"
      class="px-4 md:px-0"
      :videos="up_next"
      :next-id="autoplay ? next_video?.id : undefined"
      :loading="channel_videos_status === 'pending'"
    />
  </div>
</template>
