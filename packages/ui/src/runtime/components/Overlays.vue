<script lang="ts" setup>
import { defineComponent, h, provide, Transition } from "vue";

import { useWatcherOverlay, type Overlay } from "../composables/useWatcherOverlay";

const { overlays, close, destroy } = useWatcherOverlay();

const OverlayChild = defineComponent<{ overlay: Overlay<any, any> }>(
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
                onClose: (params: any) => close(props.overlay.id, params),
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
