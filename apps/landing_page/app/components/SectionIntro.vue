<script lang="ts" setup>
defineProps<{ id: string; title: string; soft: string; lead?: string }>();
</script>

<template>
  <section :id="id" :aria-labelledby="`${id}-title`" class="pt-[clamp(90px,15vh,150px)]">
    <div class="container">
      <TwoToneTitle :id="`${id}-title`" :title="title" :soft="soft" />
      <p v-if="lead" class="lead mt-4.5">{{ lead }}</p>
      <slot />
    </div>
  </section>
</template>
