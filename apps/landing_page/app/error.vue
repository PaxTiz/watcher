<script lang="ts" setup>
const props = defineProps<{
  error?: { statusCode: number; statusMessage?: string; message?: string };
}>();

const { t } = useI18n();

const statusCode = computed(() => props.error?.statusCode ?? 404);
const isNotFound = computed(() => statusCode.value === 404);
const title = computed(() => t(isNotFound.value ? "error.notFound.title" : "error.generic.title"));
const description = computed(() =>
  t(isNotFound.value ? "error.notFound.description" : "error.generic.description"),
);

useSeoMeta({ title, description });
useRobotsRule("noindex, nofollow");

function handleBackHome() {
  clearError({ redirect: "/" });
}
</script>

<template>
  <Navbar />

  <section class="bg-background flex min-h-[70vh] items-center pt-28 sm:pt-36">
    <div class="container flex flex-col items-center gap-4 text-center">
      <span class="text-alt text-6xl font-black sm:text-7xl">{{ statusCode }}</span>

      <h1 class="page-title">{{ title }}</h1>
      <p class="max-w-md text-lg text-gray-300">{{ description }}</p>

      <WatcherButton
        :label="t('error.backHome')"
        color="secondary"
        size="lg"
        icon="lucide:arrow-left"
        class="mt-4 font-bold"
        @click="handleBackHome"
      />
    </div>
  </section>

  <Footer />
</template>
