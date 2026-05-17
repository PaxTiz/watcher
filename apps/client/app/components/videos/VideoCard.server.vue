<script lang="ts" setup>
import { NuxtLink } from "#components";
import type { VideoResource } from "#shared/resources/videos";
import { useFormatter } from "#shared/utils/useFormatter";

const { video } = defineProps<{ video: VideoResource }>();

const { dates, numbers } = useFormatter();
</script>

<template>
  <Card
    :tag="NuxtLink"
    :to="`/videos/${video.id}`"
    size="flat"
    class="hover:border-alt border-2 border-transparent transition-all duration-300"
  >
    <div class="relative z-2">
      <div class="relative z-3">
        <NuxtImg
          class="aspect-video w-full rounded object-cover"
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
            <Icon name="lucide:play" class="text-ui-text text-2xl" />
          </div>
        </div>
      </div>

      <div
        class="absolute right-1 bottom-1 z-4 rounded bg-black/75 px-1 py-0.5 text-sm font-medium text-white"
      >
        {{ numbers.displaySeconds(video.duration) }}
      </div>
    </div>

    <div class="grid grid-cols-[2rem_1fr] gap-4 p-4">
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
  </Card>
</template>
