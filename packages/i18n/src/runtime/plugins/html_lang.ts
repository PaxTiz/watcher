import { defineNuxtPlugin, useHead } from "#imports";

export default defineNuxtPlugin((nuxtApp) => {
  useHead({
    htmlAttrs: {
      lang: () => nuxtApp.$i18n.localeProperties.value.language,
    },
  });
});
