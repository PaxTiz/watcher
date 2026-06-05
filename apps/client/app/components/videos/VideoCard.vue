<script lang="ts" setup>
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

const inner_video = ref(video);
const viewing_progression = ref(inner_video.value.viewing_progression);

const dropdown_items = computed(() => {
  const items = [];
  if (allowHideVideo) {
    items.push({
      icon: "lucide:video-off",
      key: "hide_video",
      label: "Masquer la vidéo",
      on_select: () => on_hide_video(() => on_hide_video_callback?.()),
    });
  }
  if (allowHideChannel) {
    items.push({
      icon: "lucide:circle-off",
      key: "hide_subscription",
      label: "Masquer la chaîne",
      on_select: () =>
        on_hide_subscription(async () => {
          await forceRefresh();
          await on_hide_video_callback?.();
        }),
    });
  }
  if (viewing_progression.value <= 0.9) {
    items.push({
      icon: "lucide:check-check",
      key: "mark_as_read",
      label: "Marquer comme vue",
      on_select: () => on_mark_as_read(() => (viewing_progression.value = 1)),
    });
  }

  items.push({
    icon: inner_video.value.author.is_favorite ? "lucide:star-off" : "lucide:star",
    key: "toggle_favorite",
    label: inner_video.value.author.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris",
    on_select: () =>
      on_toggle_subscription_favorite(async () => {
        inner_video.value.author.is_favorite = !inner_video.value.author.is_favorite;
        await on_hide_video_callback?.();
      }),
  });

  return items;
});

const { on_hide_video, on_hide_subscription, on_mark_as_read, on_toggle_subscription_favorite } =
  useVideo(video);
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
