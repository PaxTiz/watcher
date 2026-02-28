<script lang="ts" setup>
import type { VideoResource } from "#shared/resources/videos";
import { useFormatter } from "#shared/utils/useFormatter";
import { formatDuration } from "date-fns";

const { video } = defineProps<{ video: VideoResource }>();

const { dates, numbers } = useFormatter();
</script>

<template>
  <nuxt-link
    class="group block p-2 bg-ui-bg rounded border focus:outline-alt"
    :to="`/videos/${video.id}`"
  >
    <div class="relative z-1">
      <NuxtImg
        class="border-2 border-transparent group-hover:border-alt aspect-video w-full object-cover rounded transition-all duration-300"
        loading="lazy"
        format="avif,webp"
        width="380"
        quality="100"
        :src="video.thumbnail"
        :placeholder="[380, 180, 100, 20]"
        :alt="`Image de la vidéo #${video.id}`"
      />

      <div
        class="absolute z-2 bottom-1 right-1 bg-black/75 text-white text-sm font-medium px-1 py-0.5 rounded"
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
