<script lang="ts" setup>
const { palette } = useAmbient();

// Two layers so a new light fades in over the previous one
const layers = ref<[string, string]>(["none", "none"]);
const active_layer = ref<0 | 1>(0);

watch(
  palette,
  (value) => {
    const background = palette_light(value, 0.3);
    if (background === layers.value[active_layer.value]) {
      return;
    }

    const next = active_layer.value === 0 ? 1 : 0;
    layers.value[next] = background;
    active_layer.value = next;
  },
  { immediate: true },
);

watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.style.setProperty("--tint", palette.value?.base ?? "254 100 11");
  }
});
</script>

<template>
  <div
    class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[80vh] [mask-image:linear-gradient(to_bottom,black_20%,transparent_95%)] dark:block"
    aria-hidden="true"
  >
    <div
      v-for="(layer, index) in layers"
      :key="index"
      class="absolute inset-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none"
      :style="{ backgroundImage: layer, opacity: index === active_layer ? 1 : 0 }"
    />
  </div>
</template>
