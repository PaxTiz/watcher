<script lang="ts" setup>
import type { DropdownItem } from "@watcher/ui";

const { t, locale, locales, setLocale } = useI18n();

const flagIcons: Record<string, string> = {
  fr: "circle-flags:fr",
  en: "circle-flags:gb",
  es: "circle-flags:es",
};

const items = computed<Array<DropdownItem>>(() =>
  (locales.value as Array<{ code: string }>).map(({ code }) => ({
    key: "language",
    label: t(`language.${code}` as "language.fr" | "language.en" | "language.es"),
    value: code,
    icon: flagIcons[code],
  })),
);

async function onSelect(_key: string, value: string) {
  await setLocale(value as "fr" | "en" | "es");
}
</script>

<template>
  <WatcherDropdownButton
    icon="lucide:languages"
    :aria-label="t('language.label')"
    :items="items"
    :value="locale"
    color="ghost"
    align="center"
    @select="onSelect"
  />
</template>
