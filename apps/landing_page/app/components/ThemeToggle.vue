<script lang="ts" setup>
import type { DropdownItem } from "@watcher/ui";

const { t } = useI18n();
const colorMode = useColorMode();

const icons: Record<string, string> = {
  system: "lucide:monitor",
  light: "lucide:sun",
  dark: "lucide:moon",
};

const items = computed<Array<DropdownItem>>(() => [
  { key: "theme", label: t("theme.system"), value: "system", icon: "lucide:monitor" },
  { key: "theme", label: t("theme.light"), value: "light", icon: "lucide:sun" },
  { key: "theme", label: t("theme.dark"), value: "dark", icon: "lucide:moon" },
]);

const onSelect = (_key: string, value: string) => {
  colorMode.preference = value;
};
</script>

<template>
  <WatcherDropdownButton
    :icon="icons[colorMode.preference] ?? 'lucide:monitor'"
    :items="items"
    :value="colorMode.preference"
    color="ghost"
    align="center"
    @select="onSelect"
  />
</template>
