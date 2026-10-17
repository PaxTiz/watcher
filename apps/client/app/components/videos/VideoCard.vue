<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";

import { useFormatter } from "#shared/utils/useFormatter";
import { useVideo } from "~/composables/videos/useVideo";

const {
  video,
  allowHideChannel = true,
  allowHideVideo = true,
  allowToggleFavorite = true,
} = defineProps<{
  video: VideoResource;
  allowHideVideo?: boolean;
  allowHideChannel?: boolean;
  allowToggleFavorite?: boolean;
}>();

const emit = defineEmits<{
  hideVideo: [];
  hideSubscription: [];
  markAsView: [];
  toggleFavorite: [];
}>();

const { dates, numbers } = useFormatter();
const { forceRefresh: refresh_subscriptions } = useSubscriptions();

const viewing_progression = ref(video.viewing_progression);
const hidden_reason = ref<"video" | "channel" | undefined>();

const is_watched = computed(() => viewing_progression.value > 0.9);

const dropdown_items = computed(() => {
  const video_items = [];
  if (allowHideVideo) {
    video_items.push({
      icon: "lucide:video-off",
      key: "hide_video",
      label: "Masquer la vidéo",
      on_select: async () => {
        await on_hide_video(() => {
          hidden_reason.value = "video";

          emit("hideVideo");
        });
      },
    });
  }

  if (!is_watched.value) {
    video_items.push({
      icon: "lucide:check-check",
      key: "mark_as_read",
      label: "Marquer comme vue",
      on_select: async () => {
        await on_mark_as_read(() => {
          viewing_progression.value = 1;
          emit("markAsView");
        });
      },
    });
  }

  const subscription_items = [];
  if (allowHideChannel) {
    subscription_items.push({
      icon: "lucide:circle-off",
      key: "hide_subscription",
      label: "Masquer la chaîne",
      on_select: async () => {
        await on_hide_subscription(async () => {
          hidden_reason.value = "channel";

          emit("hideSubscription");
          await refresh_subscriptions();
        });
      },
    });
  }

  if (allowToggleFavorite) {
    subscription_items.push({
      icon: video.author.is_favorite ? "lucide:star-off" : "lucide:star",
      key: "toggle_favorite",
      label: video.author.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris",
      on_select: async () => {
        await on_toggle_subscription_favorite(async () => {
          emit("toggleFavorite");
          await refresh_subscriptions();
        });
      },
    });
  }

  const items = [];
  if (video_items.length > 0) {
    items.push({ label: "Vidéo", type: "label" });
    items.push(...video_items);
  }

  if (video_items.length > 0 && subscription_items.length > 0) {
    items.push({ type: "divider" });
  }

  if (subscription_items.length > 0) {
    items.push({ label: "Abonnement", type: "label" });
    items.push(...subscription_items);
  }

  return items;
});

const { on_hide_video, on_hide_subscription, on_mark_as_read, on_toggle_subscription_favorite } =
  useVideo(video);
</script>

<template>
  <div
    v-if="hidden_reason"
    class="border-ui-border text-ui-text-muted flex aspect-video flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-4 text-center"
  >
    <Icon
      :name="hidden_reason === 'video' ? 'lucide:video-off' : 'lucide:circle-off'"
      class="mb-1 text-2xl"
    />
    <p class="text-ui-text font-semibold">
      {{ hidden_reason === "video" ? "Vidéo masquée" : "Chaîne masquée" }}
    </p>
    <p class="text-sm">
      {{
        hidden_reason === "video"
          ? "Elle n'apparaîtra plus dans votre flux."
          : "Ses vidéos n'apparaîtront plus dans votre flux."
      }}
    </p>
  </div>

  <article v-else class="group">
    <NuxtLink
      :to="`/videos/${video.id}`"
      class="focus-visible:outline-alt block rounded-xl"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="bg-ui-border/40 relative aspect-video overflow-hidden rounded-xl">
        <NuxtImg
          class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          :class="{ 'opacity-60': is_watched }"
          loading="lazy"
          format="avif,webp"
          width="420"
          quality="90"
          :src="video.thumbnail"
          alt=""
        />

        <span
          v-if="is_watched"
          class="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white"
        >
          <Icon name="lucide:check" /> Vue
        </span>

        <span
          class="absolute right-2 bottom-2 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums"
          :class="{ 'bottom-3': viewing_progression > 0 }"
        >
          {{ numbers.displaySeconds(video.duration) }}
        </span>

        <div v-if="viewing_progression > 0" class="absolute inset-x-0 bottom-0 h-1 bg-white/30">
          <div
            class="bg-alt h-full"
            :style="{ width: `${Math.min(viewing_progression, 1) * 100}%` }"
          />
        </div>
      </div>
    </NuxtLink>

    <div class="mt-3 flex items-start gap-1">
      <NuxtLink
        :to="`/videos/${video.id}`"
        class="focus-visible:outline-alt flex min-w-0 flex-1 gap-3 rounded-lg"
      >
        <NuxtImg
          class="bg-ui-border size-9 shrink-0 rounded-full object-cover"
          loading="lazy"
          format="avif,webp"
          width="36"
          height="36"
          :src="video.author.channel.logo"
          alt=""
        />

        <div class="min-w-0">
          <h2 class="text-ui-text line-clamp-2 leading-snug font-semibold" :title="video.title">
            {{ video.title }}
          </h2>

          <p class="text-ui-text-muted mt-1 flex items-center gap-1.5 text-sm">
            <Icon
              :name="video.service === 'youtube' ? 'fa7-brands:youtube' : 'fa7-brands:twitch'"
              :class="video.service === 'youtube' ? 'text-[#ff0033]' : 'text-[#9146ff]'"
              class="shrink-0"
              :aria-label="video.service === 'youtube' ? 'YouTube' : 'Twitch'"
            />
            <span class="truncate">{{ video.author.name }}</span>
            <span aria-hidden="true">·</span>
            <time class="shrink-0" :datetime="video.created_at">
              {{ dates.ago(video.created_at) }}
            </time>
          </p>
        </div>
      </NuxtLink>

      <div
        v-if="dropdown_items.length > 0"
        class="-mt-1 -mr-2 shrink-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:hover)]:opacity-0"
      >
        <WatcherDropdownButton
          color="ghost"
          align="end"
          size="sm"
          icon-size="lg"
          icon="lucide:ellipsis-vertical"
          aria-label="Actions sur la vidéo"
          :items="dropdown_items"
        />
      </div>
    </div>
  </article>
</template>
