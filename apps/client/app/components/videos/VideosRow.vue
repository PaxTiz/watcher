<script lang="ts" setup>
import type { VideoResource } from "@watcher/common";
import type { RouteLocationRaw } from "vue-router";

defineProps<{
  title: string;
  icon: string;
  videos: Array<VideoResource>;
  loading?: boolean;
  to?: RouteLocationRaw;
}>();

const emit = defineEmits<{ change: [] }>();

const scroller = useTemplateRef("scroller");
const { arrivedState } = useScroll(scroller);

const scroll_by_page = (direction: 1 | -1) => {
  if (!scroller.value) {
    return;
  }

  scroller.value.scrollBy({ left: direction * scroller.value.clientWidth, behavior: "smooth" });
};
</script>

<template>
  <section>
    <div class="mb-4 flex items-center gap-3">
      <h2 class="font-display text-ui-text flex items-center gap-2.5 text-lg font-semibold">
        <Icon :name="icon" class="text-ui-text-muted text-base" />
        {{ title }}
      </h2>

      <NuxtLink
        v-if="to"
        :to="to"
        class="text-ui-text-muted hover:text-alt ml-1 text-sm font-semibold transition-colors"
      >
        Tout voir
      </NuxtLink>

      <div class="ml-auto hidden gap-1 md:flex">
        <button
          class="text-ui-text hover:bg-ui-border/50 flex size-8 items-center justify-center rounded-full border border-[var(--navbar-border)] transition disabled:opacity-30"
          aria-label="Précédent"
          :disabled="arrivedState.left"
          @click="scroll_by_page(-1)"
        >
          <Icon name="lucide:chevron-left" />
        </button>
        <button
          class="text-ui-text hover:bg-ui-border/50 flex size-8 items-center justify-center rounded-full border border-[var(--navbar-border)] transition disabled:opacity-30"
          aria-label="Suivant"
          :disabled="arrivedState.right"
          @click="scroll_by_page(1)"
        >
          <Icon name="lucide:chevron-right" />
        </button>
      </div>
    </div>

    <div
      ref="scroller"
      class="grid snap-x snap-mandatory [scrollbar-width:none] auto-cols-[80%] grid-flow-col gap-4 overflow-x-auto pb-2 sm:auto-cols-[calc((100%-1rem)/2)] lg:auto-cols-[calc((100%-2rem)/3)] 2xl:auto-cols-[calc((100%-3rem)/4)]"
    >
      <template v-if="loading">
        <VideoCardSkeleton v-for="i in 4" :key="i" :index="i" class="snap-start" />
      </template>

      <VideoCard
        v-for="video in videos"
        v-else
        :key="video.id"
        :video="video"
        class="snap-start"
        @hide-video="emit('change')"
        @hide-subscription="emit('change')"
        @toggle-favorite="emit('change')"
        @mark-as-view="emit('change')"
      />
    </div>
  </section>
</template>
