<script lang="ts" setup>
import { toast } from "vue-sonner";

import { NuxtLink } from "#components";
import type { VideoResource } from "#shared/resources/videos";
import { useFormatter } from "#shared/utils/useFormatter";

const on_hide_video_callback = inject<VideoOnHideType | undefined>(VIDE_ON_HIDE_SYMBOL, undefined);

const {
  video,
  allowHideChannel = true,
  allowHideVideo = true,
} = defineProps<{
  video: VideoResource;
  allowHideVideo?: boolean;
  allowHideChannel?: boolean;
}>();

const { dates, numbers } = useFormatter();
const { forceRefresh } = useSubscriptions();

const viewing_progression = ref(video.viewing_progression);

const dropdown_items = computed(() => {
  const items = [];
  if (allowHideVideo) {
    items.push({
      icon: "lucide:video-off",
      key: "hide_video",
      label: "Masquer la vidéo",
      on_select: on_hide_video,
    });
  }
  if (allowHideChannel) {
    items.push({
      icon: "lucide:circle-off",
      key: "hide_subscription",
      label: "Masquer la chaîne",
      on_select: on_hide_subscription,
    });
  }
  if (viewing_progression.value <= 0.9) {
    items.push({
      icon: "lucide:check-check",
      key: "maek_as_read",
      label: "Marquer comme vue",
      on_select: on_mark_as_read,
    });
  }

  return items;
});

const { error: video_progress_error, execute: video_progress } = usePost(
  `/api/videos/${video.id}/progress`,
  {
    method: "POST",
    body: { progression: 1 },
  },
);
const { error: video_error, execute: video_hide } = usePost(`/api/videos/${video.id}/hide`, {
  method: "POST",
});
const { error: subscription_error, execute: subscription_hide } = usePost(
  `/api/subscriptions/${video.author.id}/hide`,
  {
    method: "POST",
  },
);

const on_hide_video = async () => {
  const ok = await useConfirm({
    title: "Masquer une vidéo",
    description:
      "Voulez-vous vraiment masquer cette vidéo ? Elle n'apparaîtra plus dans votre flux.",
  });

  if (ok) {
    await video_hide();

    if (!video_error.value) {
      toast.success("La vidéo a été masquée");
      await on_hide_video_callback?.();
    }
  }
};

const on_hide_subscription = async () => {
  const ok = await useConfirm({
    title: "Masquer une chaîne",
    description:
      "Voulez-vous vraiment masquer cette chaîne ? L'historique ainsi que les nouvelles vidéos publiées par cette chaîne ne seront plus visibles dans votre flux.",
  });

  if (ok) {
    await subscription_hide();

    if (!subscription_error.value) {
      await forceRefresh();
      await on_hide_video_callback?.();

      toast.success("La chaîne a été masquée");
    }
  }
};

const on_mark_as_read = async () => {
  await video_progress();

  if (!video_progress_error.value) {
    viewing_progression.value = 1;
    toast.success("La vidéo a été marquée comme vue");
  }
};
</script>

<template>
  <Card
    :tag="NuxtLink"
    :to="`/videos/${video.id}`"
    size="flat"
    class="hover:border-alt shadow-ui-border border-2 border-transparent shadow transition-all duration-300"
  >
    <div class="relative z-2">
      <div class="relative z-3">
        <NuxtImg
          class="aspect-video w-full rounded-t object-cover"
          loading="lazy"
          format="avif,webp"
          width="380"
          quality="100"
          :src="video.thumbnail"
          :alt="`Image de la vidéo #${video.id}`"
        />

        <div
          class="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-all duration-300 group-hover:opacity-100"
        >
          <div
            class="ring-ui-text flex size-[50px] items-center justify-center rounded-full bg-black/75 ring"
          >
            <Icon name="lucide:play" class="dark:text-ui-text text-2xl text-white" />
          </div>
        </div>
      </div>

      <div
        class="absolute right-1 bottom-1 z-4 rounded bg-black/75 px-1 py-0.5 text-sm font-medium text-white"
      >
        {{ numbers.displaySeconds(video.duration) }}
      </div>

      <div
        v-if="viewing_progression > 0"
        class="absolute bottom-0 left-0 z-4 h-1 bg-red-500"
        :style="{ width: `${viewing_progression * 100}%` }"
      >
        <!--  -->
      </div>
    </div>

    <div class="grid grid-cols-[2rem_1fr_2rem] gap-4 p-4">
      <div>
        <NuxtImg
          class="w-full rounded"
          loading="lazy"
          format="avif,webp"
          width="32"
          height="32"
          densities="x1"
          :src="video.author.channel.logo"
          :alt="`Logo de ${video.author.name}`"
        />
      </div>

      <div class="-mt-0.5">
        <h2 class="text-ui-text text-lg leading-snug font-medium">
          {{ video.title }}
        </h2>

        <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <div class="flex items-center gap-1">
            <Icon
              class="text-ui-text"
              :name="
                video.author.channel.service === 'youtube' ? 'lucide:youtube' : 'lucide:twitch'
              "
            />

            <p class="text-ui-text">{{ video.author.name }}</p>
          </div>

          <span class="text-ui-text"> - </span>

          <span class="text-ui-text text-sm">{{ dates.ago(video.created_at) }} </span>
        </div>
      </div>

      <div v-if="dropdown_items.length > 0">
        <DropdownButton
          color="ghost"
          align="center"
          size="sm"
          icon-size="lg"
          icon="lucide:ellipsis-vertical"
          :ui="{ button: { root: 'p-1 hover:bg-gray-100' } }"
          :items="dropdown_items"
        />
      </div>
    </div>
  </Card>
</template>
