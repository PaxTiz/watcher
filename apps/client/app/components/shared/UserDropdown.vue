<script lang="ts" setup>
import type { DropdownItem } from "@watcher/ui";
import { toast } from "vue-sonner";

const { compact = false } = defineProps<{ compact?: boolean }>();

const { user, clear } = useUserSession();
const colorMode = useColorMode();

const is_synchronising = ref(false);

const onSelect = async (key: string, value: string) => {
  if (key === "theme") {
    colorMode.preference = value;
    return;
  }

  if (key === "actions") {
    if (value === "settings") {
      await navigateTo("/settings");
    } else if (value === "sync") {
      is_synchronising.value = true;
      const toast_id = toast.loading("Synchronisation en cours..");

      const { error } = await usePost(
        "/api/subscriptions/sync",
        {
          method: "POST",
        },
        { immediate: true },
      );

      if (error.value) {
        toast.error("Une erreur est survenue lors de la synchronisation", { id: toast_id });
      } else {
        toast.success("Synchronisation terminée", { id: toast_id });
      }

      is_synchronising.value = false;
    } else if (value === "logout") {
      await clear();
      await navigateTo("/auth/login");
    }
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
          ? 'mx-auto size-10 justify-center !px-0 rounded-lg text-ui-text-muted hover:text-ui-text hover:!bg-white/[0.06]'
          : 'w-full justify-start gap-3 !px-3 rounded-lg text-sm text-ui-text-muted hover:text-ui-text hover:!bg-white/[0.06]',
      },
    }"
    :items="items"
    @select="onSelect"
  />
</template>
