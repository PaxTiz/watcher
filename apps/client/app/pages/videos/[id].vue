<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";

import { useVideos } from "~/composables/videos/useVideos";

definePageMeta({ name: pages.videos_single });

const route = useRoute();
const { dates } = useFormatter();

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

// Already watched videos are not worth playing automatically
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
    class="video-tinted mx-auto grid max-w-[1800px] gap-6 pb-8 md:px-6 xl:grid-cols-[minmax(0,1fr)_24rem]"
    :style="video_tones_style(data.color)"
  >
    <div class="min-w-0">
      <div class="relative">
        <!-- Ambilight: the video's own colours spill around the player -->
        <NuxtImg
          class="pointer-events-none absolute -inset-x-[3%] -inset-y-[5%] hidden h-[110%] w-[106%] max-w-none rounded-[40px] object-cover opacity-45 blur-[70px] saturate-150 md:block"
          format="webp"
          width="320"
          :src="data.thumbnail"
          alt=""
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
