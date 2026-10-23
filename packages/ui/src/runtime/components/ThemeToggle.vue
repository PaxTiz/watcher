<script lang="ts" setup>
import { computed } from "vue";

import { useI18n } from "#imports";

import { useWatcherThemes } from "../composables/useWatcherThemes";
import type { DropdownItem } from "../types/dropdown";
import DropdownButton from "./DropdownButton.vue";

const { t } = useI18n();
const { colorMode, options, icon, changeTheme } = useWatcherThemes();

const items = computed<Array<DropdownItem>>(() =>
  options.value.map((option) => ({ key: "theme", ...option })),
);
</script>

<template>
  <DropdownButton
    :icon="icon"
    :aria-label="t('theme.label')"
    :items="items"
    :value="colorMode.preference"
    color="ghost"
    align="center"
    @select="(_key, value) => changeTheme(value)"
  />
</template>
