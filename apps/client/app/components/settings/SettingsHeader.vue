<script lang="ts" setup>
import { toast } from "vue-sonner";

const { clear } = useUserSession();

const on_logout = async () => {
  const { error } = await usePost("/api/auth/logout", {
    method: "POST",
  });

  if (error.value) {
    toast.error("Une erreur est survenue lors de la déconnexion");
  } else {
    await clear();
    await navigateTo("/auth/login");
  }
};
</script>

<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-ui-text text-4xl font-bold">Paramètres</h1>
      <p class="text-ui-text-muted mt-2">
        Gérez vos intégrations et les paramètres de votre compte.
      </p>
    </div>
    <Button label="Me déconnecter" color="primary" icon="lucide:log-out" @click="on_logout" />
  </div>
</template>
