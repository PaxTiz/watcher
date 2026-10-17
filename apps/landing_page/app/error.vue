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
  <a href="#main-content" class="skip-link">{{ t("a11y.skipToContent") }}</a>

  <Navbar />

  <main id="main-content">
    <section class="flex min-h-[70vh] items-center pt-24">
      <div class="container">
        <p class="text-alt font-mono text-sm">{{ statusCode }}</p>
        <TwoToneTitle
          as="h1"
          size="hero"
          :title="title"
          :soft="description"
          class="mt-4 max-w-3xl"
        />
        <WatcherButton
          :label="t('error.backHome')"
          color="solid"
          size="lg"
          icon="lucide:arrow-left"
          class="mt-8"
          @click="handleBackHome"
        />
      </div>
    </section>
  </main>

  <Footer />
</template>
