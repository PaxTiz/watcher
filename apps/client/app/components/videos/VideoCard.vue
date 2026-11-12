<script lang="ts" setup>
import type { VideoListResource } from "@watcher/common";
import type { DropdownItem } from "@watcher/ui";

import { useVideo } from "~/composables/videos/useVideo";

const {
  video,
  allowHideChannel = true,
  allowHideVideo = true,
  allowToggleFavorite = true,
} = defineProps<{
  video: VideoListResource;
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

const { t } = useI18n();
const { dates, numbers } = useFormatter();
const refresh_subscriptions = useRefreshSubscriptions();
const { integration_data } = useIntegrations();

const viewing_progression = ref(video.viewing_progression);
const hidden_reason = ref<"video" | "channel" | undefined>();

const is_watched = computed(() => viewing_progression.value > 0.9);
const integration = computed(() => integration_data(video.service));

const dropdown_items = computed(() => {
  const video_items = [];
  if (allowHideVideo) {
    video_items.push({
      icon: "lucide:video-off",
      key: "hide_video",
      label: t("videos.hide.action"),
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
      label: t("videos.mark_as_watched.action"),
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
      label: t("videos.hide_channel.action"),
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
      label: t(
        video.author.is_favorite ? "subscriptions.favorite.remove" : "subscriptions.favorite.add",
      ),
      on_select: async () => {
        await on_toggle_subscription_favorite(async () => {
          emit("toggleFavorite");
          await refresh_subscriptions();
        });
      },
    });
  }

  const items: Array<DropdownItem> = [
    { key: "video", label: t("videos.video"), type: "label" as const },
  ];
  if (video_items.length > 0) {
    items.push({
      type: "item",
      label: t("subscriptions.open_new_tab"),
      icon: "lucide:external-link",
      on_select: () => window.open(`/videos/${video.id}`, "_blank"),
    });
    items.push({
      type: "item",
      label: t("subscriptions.open_on", {
        service: video.service === "youtube" ? "YouTube" : "Twitch",
      }),
      icon: integration.value.icon,
      on_select: () => window.open(video.url, "_blank"),
    });
    items.push(...video_items);
  }

  if (video_items.length > 0 && subscription_items.length > 0) {
    items.push({ key: "divider", label: "", type: "divider" as const });
  }

  if (subscription_items.length > 0) {
    items.push({ key: "subscription", label: t("videos.subscription"), type: "label" as const });
    items.push(...subscription_items);
  }

  return items;
});

const menu_opened = ref(false);
const menu_items = computed(() => (menu_opened.value ? dropdown_items.value : []));

const { on_hide_video, on_hide_subscription, on_mark_as_read, on_toggle_subscription_favorite } =
  useVideo(video);

const tones_style = computed(() => video_tones_style(video.palette));
const is_new = computed(() => Date.now() - new Date(video.created_at).getTime() < 24 * 3600 * 1000);
</script>

<template>
  <WatcherContextMenu :items="menu_items" @update:open="menu_opened = true">
    <div
      v-if="hidden_reason"
      class="border-ui-border text-ui-text-muted flex aspect-video flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-4 text-center"
    >
      <Icon
        :name="hidden_reason === 'video' ? 'lucide:video-off' : 'lucide:circle-off'"
        class="mb-1 text-2xl"
      />
      <p class="text-ui-text font-semibold">
        {{ t(hidden_reason === "video" ? "videos.hide.hidden" : "videos.hide_channel.hidden") }}
      </p>
      <p class="text-sm">
        {{
          t(
            hidden_reason === "video"
              ? "videos.hide.hidden_description"
              : "videos.hide_channel.hidden_description",
          )
        }}
      </p>
    </div>

    <article
      v-else
      class="group video-tinted -m-2 rounded-2xl p-2 transition-colors duration-300 hover:bg-[rgb(var(--c)/0.12)] motion-reduce:transition-none dark:hover:bg-[rgb(var(--c)/0.14)]"
      :style="tones_style"
    >
      <NuxtLink
        :to="`/videos/${video.id}`"
        class="focus-visible:outline-alt relative block rounded-xl"
        tabindex="-1"
        aria-hidden="true"
      >
        <div
          class="bg-ui-border/40 relative aspect-video overflow-hidden rounded-xl shadow-[0_0_0_1px_rgb(255_255_255/0.06)]"
        >
          <NuxtImg
            class="size-full object-cover"
            :class="{ 'opacity-60': is_watched }"
            loading="lazy"
            format="avif,webp"
            width="420"
            quality="90"
            :src="video.thumbnails.small"
            alt=""
          />

          <span
            v-if="is_watched"
            class="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white"
          >
            <Icon name="lucide:check" /> {{ t("videos.watched") }}
          </span>
          <span
            v-else-if="is_new"
            class="bg-alt absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-black uppercase"
          >
            {{ t("videos.new") }}
          </span>

          <span
            v-if="video.is_hidden"
            class="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white"
          >
            <Icon name="lucide:eye-off" /> {{ t("videos.hidden") }}
          </span>

          <span
            class="absolute right-2 bottom-2 rounded-lg bg-[rgb(var(--c-dark)/0.8)] px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums shadow-[inset_1px_1px_0_-0.5px_rgb(255_255_255/0.5),inset_-1px_-1px_0_-0.5px_rgb(255_255_255/0.15)]"
            :class="{ 'bottom-3': viewing_progression > 0 }"
          >
            {{ numbers.displaySeconds(video.duration) }}
          </span>

          <div v-if="viewing_progression > 0" class="absolute inset-x-0 bottom-0 h-1 bg-white/25">
            <div
              class="h-full bg-[rgb(var(--c-vivid))]"
              :style="{ width: `${Math.min(viewing_progression, 1) * 100}%` }"
            />
          </div>
        </div>
      </NuxtLink>

      <div class="mt-3 flex items-start gap-1">
        <div class="flex min-w-0 flex-1 gap-3">
          <NuxtLink
            :to="`/videos/${video.id}`"
            class="focus-visible:outline-alt shrink-0 rounded-full"
            tabindex="-1"
            aria-hidden="true"
          >
            <NuxtImg
              class="bg-ui-border size-9 rounded-full object-cover"
              loading="lazy"
              format="avif,webp"
              width="36"
              height="36"
              :src="video.author.channel.logo"
              alt=""
            />
          </NuxtLink>

          <div class="min-w-0">
            <NuxtLink
              :to="`/videos/${video.id}`"
              class="focus-visible:outline-alt block rounded-lg"
            >
              <h2
                class="text-ui-text line-clamp-2 text-[15px] leading-snug font-medium transition-colors duration-300 group-hover:text-[rgb(var(--c-ink))] dark:group-hover:text-[rgb(var(--c-light))]"
                :title="video.title"
              >
                {{ video.title }}
              </h2>
            </NuxtLink>

            <p class="text-ui-text-muted mt-1 flex items-center gap-1.5 text-sm">
              <Icon
                :name="video.service === 'youtube' ? 'fa7-brands:youtube' : 'fa7-brands:twitch'"
                :class="video.service === 'youtube' ? 'text-[#ff0033]' : 'text-[#9146ff]'"
                class="shrink-0"
                :aria-label="video.service === 'youtube' ? 'YouTube' : 'Twitch'"
              />

              <NuxtLink class="truncate" :to="`/subscriptions/${video.author.slug}`">
                {{ video.author.name }}
              </NuxtLink>

              <span aria-hidden="true">·</span>
              <time class="shrink-0" :datetime="video.created_at">
                {{ dates.ago(video.created_at) }}
              </time>
            </p>
          </div>
        </div>

        <div
          class="-mt-1 -mr-2 shrink-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:hover)]:opacity-0"
        >
          <WatcherDropdownButton
            color="ghost"
            align="end"
            size="sm"
            icon-size="lg"
            icon="lucide:ellipsis-vertical"
            :aria-label="t('videos.actions')"
            :items="menu_items"
            @update:open="menu_opened = true"
          />
        </div>
      </div>
    </article>
  </WatcherContextMenu>
</template>
