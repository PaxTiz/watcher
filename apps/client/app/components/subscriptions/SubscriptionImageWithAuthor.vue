<script lang="ts" setup>
import type { VNode } from "vue";

const { size = "md", withHover = false } = defineProps<{
  slug: string;
  image: string;
  name: string;
  size?: "sm" | "md";
  withHover?: boolean;
}>();
defineSlots<{ bottom?: () => VNode }>();

const imageSize = computed(() => (size === "md" ? 48 : 38));
</script>

<template>
  <div
    class="flex items-center gap-4"
    :class="{ 'hover:bg-ui-bg rounded bg-transparent p-1 transition-all duration-300': withHover }"
  >
    <nuxt-link :to="`/subscriptions/${slug}`">
      <NuxtImg
        class="w-full rounded"
        loading="lazy"
        format="avif,webp"
        :width="imageSize"
        :height="imageSize"
        densities="x1"
        :src="image"
        :alt="`Logo de ${name}`"
      />
    </nuxt-link>

    <div class="shrink-0">
      <nuxt-link
        :to="`/subscriptions/${slug}`"
        :class="{ 'font-semibold': size === 'md', 'text-sm font-medium': size === 'sm' }"
        class="text-ui-text"
      >
        {{ name }}
      </nuxt-link>

      <slot v-if="$slots.bottom" name="bottom" />
    </div>
  </div>
</template>
