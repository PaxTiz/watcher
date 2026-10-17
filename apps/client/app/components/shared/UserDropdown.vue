<script lang="ts" setup>
import type { DropdownItem } from "@watcher/ui";

const { compact = false } = defineProps<{ compact?: boolean }>();

const { user, clear } = useUserSession();
const colorMode = useColorMode();

const { is_synchronising, synchronise } = useSynchronization();

const onSelect = async (key: string, value: string) => {
  if (key === "theme") {
    colorMode.preference = value;
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
    key: "actions",
    label: "Synchroniser",
    value: "sync",
    icon: "lucide:refresh-cw",
    disabled: is_synchronising.value,
  },
  {
    key: "theme",
    label: "Thème",
    icon: "lucide:palette",
    value: colorMode.preference,
    children: [
      { label: "Système", value: "system", icon: "lucide:monitor" },
      { label: "Clair", value: "light", icon: "lucide:sun" },
      { label: "Sombre", value: "dark", icon: "lucide:moon" },
    ],
  },
  {
    key: "actions",
    label: "Me déconnecter",
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
    :aria-label="user?.name ? `Compte de ${user.name}` : 'Compte'"
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
