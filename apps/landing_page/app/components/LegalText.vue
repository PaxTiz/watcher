<script lang="ts" setup>
const { text } = defineProps<{ text: string }>();

const parts = computed(() =>
  legal_parts(text).map((part) => ({
    ...part,
    external: part.href ? /^(https?:|mailto:)/.test(part.href) : false,
  })),
);

const LINK = "text-alt-text font-medium underline underline-offset-2";
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <template v-if="part.href">
      <a
        v-if="part.external"
        :href="part.href"
        :class="LINK"
        :target="part.href.startsWith('http') ? '_blank' : undefined"
        :rel="part.href.startsWith('http') ? 'noopener noreferrer' : undefined"
        >{{ part.text }}</a
      >
      <NuxtLinkLocale v-else :to="part.href as 'privacy' | 'terms'" :class="LINK">{{
        part.text
      }}</NuxtLinkLocale>
    </template>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
