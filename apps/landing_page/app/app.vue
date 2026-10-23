<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <a href="#main-content" class="skip-link">{{ t("a11y.skip_to_content") }}</a>

  <Navbar />

  <main id="main-content">
    <NuxtPage />
  </main>

  <Footer />
</template>
