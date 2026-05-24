<script lang="ts" setup>
import type { VNode } from "vue";

const props = defineProps<{
  ui?: {
    content?: string;
    body?: string;
  };
}>();
defineSlots<{ default: () => VNode }>();

const __CLOSE__ = inject<() => void>("__CLOSE__");

const overlay = useTemplateRef("overlay");

onClickOutside(overlay, () => __CLOSE__?.());
onKeyStroke("Escape", () => __CLOSE__?.());
</script>

<template>
  <div>
    <div
      class="overlay-backdrop fixed top-0 left-0 z-101 h-full w-full bg-black/80 opacity-100 transition-all duration-200"
    >
      <!-- Backdrop  -->
    </div>

    <div
      class="overlay-container fixed z-102 flex h-full w-full items-center justify-center p-4 transition-all duration-200"
      :class="[ui?.content]"
    >
      <div
        ref="overlay"
        class="bg-background relative flex w-full flex-col justify-between overflow-hidden rounded p-8 shadow shadow-black"
        :class="[ui?.body]"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  .overlay-backdrop {
    opacity: 0;
  }

  .overlay-container {
    opacity: 0;
  }
}
</style>
