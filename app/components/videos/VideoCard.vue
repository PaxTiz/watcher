<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import { useFormatter } from "#shared/utils/useFormatter";

const { video } = defineProps<{ video: VideoResource }>();

const { dates } = useFormatter();
</script>

<template>
  <nuxt-link
    class="block p-2 bg-ui-bg rounded border focus:outline-alt"
    :to="`/videos/${video.id}`"
  >
    <NuxtImg
      class="aspect-video w-full object-cover rounded"
      loading="lazy"
      format="avif,webp"
      width="380"
      quality="100"
      :src="video.thumbnail"
      :placeholder="[380, 180, 100, 20]"
      :alt="`Image de la vidéo #${video.id}`"
    />

    <div class="grid grid-cols-[2rem_1fr] gap-4 mt-4">
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
