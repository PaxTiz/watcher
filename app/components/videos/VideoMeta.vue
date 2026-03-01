<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";

const { video } = defineProps<{ video: VideoResource }>();

const { dates } = useFormatter();

const description = computed(() => {
  if (!video.description || video.description.length == 0) {
    return null;
  }

  const escaped = video.description
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const paragraphs = escaped.split(/\n{2,}/);

  const desc = paragraphs.map((p) => {
    const content = p
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g,
        '<a href="#" class="text-alt/75 yt-timestamp" data-time="$1">$1</a>',
      )
      .replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" class="text-alt/75" rel="noopener noreferrer">$1</a>',
      )
      .replace(
        /#(\w+)/g,
        '<a href="https://www.youtube.com/hashtag/$1" class="text-alt/75" target="_blank">#$1</a>',
      )
      .replace(/\n/g, "<br>");

    return `<p>${content}</p>`;
  });

  return desc.join("");
});
</script>

<template>
  <div>
    <h1 class="text-4xl text-white font-bold">{{ video.title }}</h1>

    <div class="flex flex-wrap items-center justify-between mt-4">
      <div class="flex items-center gap-4">
        <NuxtImg
          class="w-full rounded"
          loading="lazy"
          format="avif,webp"
          width="48"
          height="48"
          densities="x1"
          :src="video.author.channel.logo"
          :alt="`Logo de ${video.author.name}`"
        />

        <div class="shrink-0">
          <p class="text-white font-semibold">{{ video.author.name }}</p>
          <p class="text-ui-text text-sm">Publié le {{ dates.format(video.created_at) }}</p>
        </div>
      </div>

      <div>
        <Button
          v-if="video.service === 'youtube'"
          label="Lire sur YouTube"
          icon="lucide:youtube"
          :to="video.url"
        />
        <Button
          v-if="video.service === 'twitch'"
          label="Lire sur Twitch"
          icon="lucide:twitch"
          :to="video.url"
        />
      </div>
    </div>

    <div
      v-if="description"
      v-html="description"
      class="text-ui-text leading-snug [&>p]:mt-4 [&>p]:leading-relaxed mt-8"
    />
  </div>
</template>
