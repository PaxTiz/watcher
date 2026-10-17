<script lang="ts" setup>
const { source } = useAmbient();
const image = useImage();

// Two layers so a new source fades in over the previous one
const layers = ref<[string | null, string | null]>([null, null]);
const active_layer = ref<0 | 1>(0);

watch(
  () => source.value?.thumbnail,
  (thumbnail) => {
    const url = thumbnail ? image(thumbnail, { width: 160, format: "webp" }) : null;
    if (url === layers.value[active_layer.value]) {
      return;
    }

    const next = active_layer.value === 0 ? 1 : 0;
    layers.value[next] = url;
    active_layer.value = next;
  },
  { immediate: true },
);

watchEffect(() => {
  if (import.meta.server) {
    return;
  }

  const tones = color_tones(source.value?.color);
  document.documentElement.style.setProperty("--tint", tones?.base ?? "254 100 11");
});
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 -z-10 hidden h-[85vh] overflow-hidden dark:block"
    aria-hidden="true"
  >
    <img
      v-for="(layer, index) in layers"
      v-show="layer"
      :key="index"
      :src="layer ?? undefined"
      alt=""
      class="absolute -top-1/3 -left-[10%] h-full w-[120%] object-cover blur-[110px] saturate-150 transition-opacity duration-[1200ms] ease-out motion-reduce:transition-none"
      :style="{ opacity: index === active_layer ? 'var(--ambient-opacity)' : 0 }"
    />
    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/40 to-[var(--background)]"
    />
  </div>
</template>
