<script lang="ts" setup>
import { inject, useTemplateRef, type VNode } from "vue";

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
      class="overlay-backdrop fixed top-0 left-0 z-101 h-full w-full bg-black/55 opacity-100 backdrop-blur-[2px] transition-all duration-200"
    >
      <!-- Backdrop  -->
    </div>

    <div
      class="overlay-container fixed z-102 flex h-full w-full items-center justify-center p-4 transition-all duration-200"
      :class="[ui?.content]"
    >
      <div
        ref="overlay"
        class="bg-ui-bg text-ui-text relative flex w-full flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-[0_0_0_1px_var(--ui-border),0_30px_70px_-20px_rgb(0_0_0/0.55)] md:p-7"
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
