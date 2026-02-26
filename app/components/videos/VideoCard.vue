<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import { useFormatter } from "#shared/utils/useFormatter";

const { video } = defineProps<{ video: VideoResource }>();

const { dates } = useFormatter();

const thumbnail = computed(() => {
  switch (video.author.channel.service) {
    case "youtube":
      return video.thumbnail;
    case "twitch":
      if (video.thumbnail.startsWith("https://vod-secure.twitch.tv/")) {
        // Twitch API is currently limited for sizes of thumbnails, see
        // https://dev.twitch.tv/docs/api/reference/#get-videos
        return video.thumbnail.replace("%{width}", "320").replace("%{height}", "180");
      }

      return video.thumbnail.replace("%{width}", "380").replace("%{height}", "210");
  }
});
</script>

<template>
  <nuxt-link
    class="block p-2 bg-ui-bg rounded border focus:outline-alt"
    :to="`/videos/${video.id}`"
  >
    <img
      class="aspect-video w-full object-cover rounded"
      :src="thumbnail"
      loading="lazy"
      :alt="`Image de la vidéo #${video.id}`"
    />

    <div class="grid grid-cols-[2rem_1fr] gap-4 mt-4">
      <div>
        <img
          loading="lazy"
          class="rounded w-8 h-8"
          :src="video.author.channel.logo"
          :alt="`Logo de ${video.author.name}`"
        />
      </div>

      <div>
        <h2 class="text-lg text-white font-medium leading-snug">
          {{ video.title }}
        </h2>

        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
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

          <span class="text-ui-text"> - </span>

          <span class="text-ui-text text-sm">// TODO: durée</span>
        </div>
      </div>
    </div>
  </nuxt-link>
</template>
