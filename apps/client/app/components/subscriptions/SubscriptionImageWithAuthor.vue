<script lang="ts" setup>
import type { VNode } from "vue";

const { size = "md", withHover = false } = defineProps<{
  slug: string;
  image: string;
  name: string;
  hidden?: boolean;
  size?: "sm" | "md";
  withHover?: boolean;
}>();
defineSlots<{ bottom?: () => VNode }>();

const imageSize = computed(() => (size === "md" ? 48 : 38));
</script>

<template>
  <div
    class="flex items-center gap-4 overflow-hidden"
    :class="{
      'hover:bg-ui-bg rounded bg-transparent p-1 transition-all duration-300': withHover,
      'grayscale-100': hidden,
    }"
  >
    <nuxt-link :to="`/subscriptions/${slug}`" class="shrink-0" :style="{ width: `${imageSize}px` }">
      <NuxtImg
        class="aspect-square w-full rounded object-cover"
        loading="lazy"
        format="avif,webp"
        :width="imageSize"
        :height="imageSize"
        densities="x1"
        :src="image"
        :alt="`Logo de ${name}`"
      />
    </nuxt-link>

    <div class="min-w-0 flex-1">
      <nuxt-link
        :to="`/subscriptions/${slug}`"
        :class="{
          'font-semibold': size === 'md',
          'text-sm font-medium': size === 'sm',
          'text-ui-text-muted': hidden,
        }"
        class="text-ui-text block truncate"
      >
        {{ name }}
      </nuxt-link>

      <slot v-if="$slots.bottom" name="bottom" />
    </div>
  </div>
</template>
