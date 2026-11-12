<script lang="ts" setup>
defineOptions({ inheritAttrs: false });

defineProps<{ src: string }>();
</script>

<template>
  <picture v-if="src" class="contents">
    <source :srcset="`${src}.avif`" type="image/avif" />
    <img v-bind="$attrs" :src="`${src}.webp`" />
  </picture>
  <img v-else v-bind="$attrs" />
</template>
