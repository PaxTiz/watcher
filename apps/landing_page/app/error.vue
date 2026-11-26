<script lang="ts" setup>
const props = defineProps<{
  error?: { status?: number; statusText?: string; message?: string };
}>();

const { t } = useI18n();

const status = computed(() => props.error?.status ?? 404);
const isNotFound = computed(() => status.value === 404);
const title = computed(() => t(isNotFound.value ? "error.not_found.title" : "error.generic.title"));
const description = computed(() =>
  t(isNotFound.value ? "error.not_found.description" : "error.generic.description"),
);

useSeoMeta({ title, description });
useRobotsRule("noindex, nofollow");

function handleBackHome() {
  clearError({ redirect: "/" });
}
</script>

<template>
  <a href="#main-content" class="skip-link">{{ t("a11y.skip_to_content") }}</a>

  <PageSheet>
    <template #header>
      <Navbar />
    </template>

    <section class="flex min-h-[60vh] flex-col justify-center gap-6">
      <p class="text-alt-text m-0 text-sm font-semibold tabular-nums">{{ status }}</p>
      <h1
        class="font-display text-ui-text m-0 max-w-3xl text-[clamp(34px,6vw,72px)] leading-[1.04] font-medium tracking-[-0.035em] text-balance"
      >
        {{ title }}
        <span class="text-ui-text-muted block">{{ description }}</span>
      </h1>
      <WatcherButton
        :label="t('error.back_home')"
        color="solid"
        size="lg"
        icon="lucide:arrow-left"
        class="self-start"
        @click="handleBackHome"
      />
    </section>
    <Footer />
  </PageSheet>
</template>
