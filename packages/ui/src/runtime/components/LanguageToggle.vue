<script lang="ts" setup>
import { useI18n, useWatcherLocales } from "#imports";

import type { DropdownItem } from "../types/dropdown";
import DropdownButton from "./DropdownButton.vue";

const { t } = useI18n();
const { locale, options, changeLocale } = useWatcherLocales();

const items: Array<DropdownItem> = options.map((option) => ({ key: "language", ...option }));
</script>

<template>
  <DropdownButton
    icon="lucide:languages"
    :aria-label="t('language.label')"
    :items="items"
    :value="locale"
    color="ghost"
    align="center"
    @select="(_key, value) => changeLocale(value)"
  />
</template>
