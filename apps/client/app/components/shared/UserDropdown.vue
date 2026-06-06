<script lang="ts" setup>
import { toast } from "vue-sonner";

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
    disabled: is_synchronising.value,
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
