<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";

import { useVideo } from "~/composables/videos/useVideo";

const { video } = defineProps<{ video: VideoResource }>();
const emit = defineEmits<{ seek: [seconds: number] }>();

const { dates } = useFormatter();
const { forceRefresh: refresh_subscriptions } = useSubscriptions();
const { on_toggle_subscription_favorite } = useVideo(video);

const is_favorite = ref(video.author.is_favorite);
const is_expanded = ref(false);
const { scroll_to_top } = useAppScroll();

const escape_html = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const to_seconds = (timestamp: string) => {
  return timestamp
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
};

// The description comes from third parties: everything is escaped before links are added
const description = computed(() => {
  if (!video.description || video.description.length == 0) {
    return null;
  }

  const paragraphs = escape_html(video.description).split(/\n{2,}/);

  const desc = paragraphs.map((p) => {
    const content = p
      .replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" class="text-[rgb(var(--c-ink))] hover:underline dark:text-[rgb(var(--c-light))]" rel="noopener noreferrer">$1</a>',
      )
      .replace(
        /(^|[\s(])(\d{1,2}:\d{2}(?::\d{2})?)\b/g,
        (_, before: string, time: string) =>
          `${before}<button type="button" class="text-[rgb(var(--c-ink))] hover:underline dark:text-[rgb(var(--c-light))]" data-time="${to_seconds(time)}">${time}</button>`,
      )
      .replace(
        /(^|\s)#([\p{L}\p{N}_]+)/gu,
        '$1<a href="https://www.youtube.com/hashtag/$2" class="text-[rgb(var(--c-ink))] hover:underline dark:text-[rgb(var(--c-light))]" target="_blank" rel="noopener noreferrer">#$2</a>',
      )
      .replace(/\n/g, "<br>");

    return `<p>${content}</p>`;
  });

  return desc.join("");
});

const on_description_click = (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-time]");
  if (!target) {
    if (!is_expanded.value) {
      is_expanded.value = true;
    }
    return;
  }

  event.stopPropagation();
  emit("seek", Number(target.dataset.time));
  scroll_to_top();
};

const toggle_favorite = async () => {
  await on_toggle_subscription_favorite(async () => {
    is_favorite.value = !is_favorite.value;
    await refresh_subscriptions();
  });
};
</script>

<template>
  <div>
    <h1 class="font-display text-ui-text text-lg leading-snug font-medium md:text-xl">
      {{ video.title }}
    </h1>

    <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
      <NuxtLink
        :to="`/subscriptions/${video.author.slug}`"
        class="group flex min-w-0 items-center gap-3"
      >
        <NuxtImg
          class="bg-ui-border size-10 shrink-0 rounded-full object-cover"
          format="avif,webp"
          width="40"
          height="40"
          :src="video.author.channel.logo"
          alt=""
        />
        <div class="font-content min-w-0">
          <p
            class="text-ui-text truncate font-medium transition-colors group-hover:text-[rgb(var(--c-ink))] dark:group-hover:text-[rgb(var(--c-light))]"
          >
            {{ video.author.name }}
          </p>
          <p class="text-ui-text-muted flex items-center gap-1 text-sm">
            <Icon
              :name="video.service === 'youtube' ? 'fa7-brands:youtube' : 'fa7-brands:twitch'"
              :class="video.service === 'youtube' ? 'text-[#ff0033]' : 'text-[#9146ff]'"
            />
            {{ video.service === "youtube" ? "YouTube" : "Twitch" }}
          </p>
        </div>
      </NuxtLink>

      <div class="flex flex-wrap gap-2 sm:ml-auto">
        <WatcherButton
          :label="is_favorite ? 'En favoris' : 'Ajouter aux favoris'"
          :icon="is_favorite ? 'lucide:star-off' : 'lucide:star'"
          color="ghost"
          @click="toggle_favorite"
        />
        <WatcherButton
          :label="video.service === 'youtube' ? 'Ouvrir sur YouTube' : 'Ouvrir sur Twitch'"
          icon="lucide:external-link"
          :to="video.url"
          external
          new-tab
        />
      </div>
    </div>

    <div
      class="bg-ui-bg mt-4 rounded-2xl p-4 text-sm shadow-[0_0_0_1px_var(--ui-border)] dark:bg-[rgb(var(--c-dark)/0.3)] dark:shadow-[inset_0_0_0_1px_rgb(var(--c-light)/0.1)]"
      :class="{
        'hover:bg-ui-border/40 cursor-pointer transition-colors dark:hover:bg-[rgb(var(--c-dark)/0.5)]':
          !is_expanded,
      }"
      @click="on_description_click"
    >
      <p class="text-ui-text font-medium">
        Publiée {{ dates.ago(video.created_at) }} · {{ dates.format(video.created_at) }}
      </p>

      <div
        v-if="description"
        class="font-content text-ui-text mt-2 leading-relaxed break-words [&>p+p]:mt-3"
        :class="{
          'max-h-16 overflow-hidden [mask-image:linear-gradient(to_bottom,black_40%,transparent)]':
            !is_expanded,
        }"
        v-html="description"
      />

      <button
        v-if="description"
        type="button"
        class="text-ui-text mt-2 font-semibold hover:underline"
        @click.stop="is_expanded = !is_expanded"
      >
        {{ is_expanded ? "Moins" : "Plus" }}
      </button>
    </div>
  </div>
</template>
