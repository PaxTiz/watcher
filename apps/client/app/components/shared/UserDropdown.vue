<script lang="ts" setup>
import type { DropdownItem } from "@watcher/ui";

const { compact = false } = defineProps<{ compact?: boolean }>();

const { t } = useI18n();
const { user, clear } = useUserSession();
const { colorMode, options: theme_options, changeTheme } = useWatcherThemes();
const { locale, options: locale_options, changeLocale } = useWatcherLocales();

const { is_synchronising, synchronise } = useSynchronization();

const onSelect = async (key: string, value: string) => {
  if (key === "theme") {
    changeTheme(value);
    return;
  }

  if (key === "language") {
    await changeLocale(value);
    return;
  }

  if (value === "sync") {
    await synchronise();
  } else if (value === "logout") {
    await clear();
    await navigateTo("/auth/login");
  }
};

const items = computed<Array<DropdownItem>>(() => [
  {
    key: "settings",
    label: t("nav.settings"),
    value: "settings",
    icon: "lucide:settings",
    on_select: () => navigateTo("/settings"),
  },
  {
    key: "actions",
    label: t("sync.action"),
    value: "sync",
    icon: "lucide:refresh-cw",
    disabled: is_synchronising.value,
  },
  {
    key: "theme",
    label: t("theme.label"),
    icon: "lucide:palette",
    value: colorMode.preference,
    children: theme_options.value,
  },
  {
    key: "language",
    label: t("language.label"),
    icon: "lucide:languages",
    value: locale.value,
    children: locale_options,
  },
  {
    key: "actions",
    label: t("account.logout"),
    value: "logout",
    icon: "lucide:log-out",
  },
]);
</script>

<template>
  <WatcherDropdownButton
    icon="lucide:circle-user-round"
    color="ghost"
    align="start"
    :label="compact ? undefined : user?.name"
    :aria-label="user?.name ? t('account.label_of', { name: user.name }) : t('account.label')"
    :ui="{
      button: {
        root: compact
          ? 'mx-auto size-10 justify-center !px-0 rounded-lg text-ui-text-muted hover:text-ui-text hover:!bg-ui-text/[0.06]'
          : 'w-full justify-start gap-3 !px-3 rounded-lg text-sm text-ui-text-muted hover:text-ui-text hover:!bg-ui-text/[0.06]',
      },
    }"
    :items="items"
    @select="onSelect"
  />
</template>
