<script lang="ts" setup>
import { formatDuration } from "date-fns";

import type { VideoResource } from "#shared/resources/videos";
import { useFormatter } from "#shared/utils/useFormatter";

const { video } = defineProps<{ video: VideoResource }>();

const { dates, numbers } = useFormatter();
</script>

<template>
  <nuxt-link
    class="group bg-ui-bg focus:outline-alt block rounded border p-2"
    :to="`/videos/${video.id}`"
  >
    <div class="relative z-1">
      <NuxtImg
        class="group-hover:border-alt aspect-video w-full rounded border-2 border-transparent object-cover transition-all duration-300"
        loading="lazy"
        format="avif,webp"
        width="380"
        quality="100"
        :src="video.thumbnail"
        :placeholder="[380, 180, 100, 20]"
        :alt="`Image de la vidéo #${video.id}`"
      />

      <div
        class="absolute right-1 bottom-1 z-2 rounded bg-black/75 px-1 py-0.5 text-sm font-medium text-white"
      >
        {{ numbers.displaySeconds(video.duration) }}
      </div>
    </div>

    <div class="grid grid-cols-[2rem_1fr] gap-4 py-4">
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
        <h2 class="text-lg leading-snug font-medium text-white">
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
    </div>
  </nuxt-link>
</template>
