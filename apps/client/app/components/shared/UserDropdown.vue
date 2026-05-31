<script lang="ts" setup>
import { toast } from "vue-sonner";

const { user, clear } = useUserSession();
const colorMode = useColorMode();

const onSelect = async (key: string, value: string) => {
  if (key === "theme") {
    colorMode.preference = value;
    return;
  }

  if (key === "actions") {
    if (value === "settings") {
      await navigateTo("/settings");
    } else if (value === "sync") {
      const { error } = await usePost("/api/subscriptions/sync", {
        method: "POST",
      });

      if (error.value) {
        toast.error("Une erreur est survenue lors de la synchronisation");
      } else {
        toast.success("Synchronisation terminée");
      }
    } else if (value === "logout") {
      const { error } = await usePost("/api/auth/logout", {
        method: "POST",
      });

      if (error.value) {
        toast.error("Une erreur est survenue lors de la déconnexion");
      } else {
        await clear();
        await navigateTo("/auth/login");
      }
    }
  }
};

const items = computed(() => [
  {
    key: "actions",
    label: "Paramètres",
    value: "settings",
    icon: "lucide:settings",
  },
  {
    key: "actions",
    label: "Synchroniser",
    value: "sync",
    icon: "lucide:refresh-cw",
  },
  {
    key: "theme",
    label: "Thème",
    icon: "lucide:palette",
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
  <DropdownButton
    class="[&_span]:hidden [&_span]:md:block"
    icon="lucide:user"
    :label="user?.name"
    :items="items"
    @select="onSelect"
  />
</template>
