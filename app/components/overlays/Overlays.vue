<script lang="ts" setup>
import { Transition } from "vue";

const { overlays, close, destroy } = useOverlay();

const OverlayChild = defineComponent<{ overlay: any }>(
  (props) => {
    provide("__CLOSE__", () => close(props.overlay.id));

    return () =>
      h(
        Transition,
        {
          appear: true,
          onAfterLeave: () => destroy(props.overlay.id),
        },
        () =>
          props.overlay.isVisible
            ? h(props.overlay.component, {
                ...props.overlay.props,
                onClose: () => close(props.overlay.id),
              })
            : null,
      );
  },
  { props: ["overlay"] },
);
</script>

<template>
  <div class="overlay-root">
    <div v-for="overlay in overlays" :key="overlay.id">
      <OverlayChild :overlay="overlay" />
    </div>
  </div>
</template>
