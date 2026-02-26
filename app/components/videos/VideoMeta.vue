<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";

const { video } = defineProps<{ video: VideoResource }>();

const description = computed(() => {
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

    <p class="text-white mt-4">// TODO: Afficher l'auteur et un lien vers la vidéo directe</p>

    <div
      v-html="description"
      class="text-ui-text leading-snug mt-4 [&>p]:mt-4 [&>p]:leading-relaxed"
    />
  </div>
</template>
