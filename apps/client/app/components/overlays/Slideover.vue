<script lang="ts" setup>
import type { VNode } from "vue";

const props = defineProps<{
  side: "top" | "left" | "right" | "bottom";
  ui?: {
    content?: string;
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
      class="overlay-container fixed z-102 w-full p-4 transition-all duration-400"
      :class="[
        `overlay-container__${side}`,
        ui?.content,
        side === 'top' && 'top-0 right-0 left-0 translate-y-0',
        side === 'bottom' && 'right-0 bottom-0 left-0 translate-y-0',
        side === 'left' && 'top-0 bottom-0 left-0 translate-x-0',
        side === 'right' && 'top-0 right-0 bottom-0 translate-x-0',
      ]"
    >
      <div
        ref="overlay"
        class="bg-background relative flex h-full flex-col justify-between overflow-hidden rounded p-8 shadow shadow-black"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}
.v-enter-from,
.v-leave-to {
  .overlay-backdrop {
    opacity: 0;
  }

  .overlay-container.overlay-container__top {
    transform: translateY(-100%);
  }
  .overlay-container.overlay-container__bottom {
    transform: translateY(100%);
  }
  .overlay-container.overlay-container__left {
    transform: translateX(-100%);
  }
  .overlay-container.overlay-container__right {
    transform: translateX(100%);
  }
}
</style>
