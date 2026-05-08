<script lang="ts" setup>
import { Toaster } from "vue-sonner";

import "vue-sonner/style.css";
</script>

<template>
  <Toaster rich-colors close-button />

  <NuxtLoadingIndicator />

  <NuxtLayout />
</template>
