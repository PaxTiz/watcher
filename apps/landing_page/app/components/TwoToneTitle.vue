<script lang="ts" setup>
const { as = "h2", size = "section" } = defineProps<{
  title: string;
  soft: string;
  as?: "h1" | "h2";
  size?: "hero" | "section";
}>();
</script>

<template>
  <component
    :is="as"
    class="text-ui-text m-0 leading-[1.02] font-medium tracking-[-0.035em] text-balance"
    :class="size === 'hero' ? 'text-[clamp(2.6rem,6.4vw,5rem)]' : 'text-[clamp(2rem,4.2vw,3.2rem)]'"
  >
    {{ title }}.
    <span class="text-ui-text-muted block">{{ soft }}<span class="text-alt">.</span></span>
  </component>
</template>
