<script lang="ts" setup>
import { toast } from "vue-sonner";

const { clear } = useUserSession();

const on_delete_account = async () => {
  const ok = await useConfirm({
    title: "Supprimer mon compte",
    description:
      "Êtes-vous sûr(e) de vouloir supprimer votre compte ? Cette action est irréversible.",
  });

  if (!ok) {
    return;
  }

  const { error } = await usePost("/api/auth/delete", {
    method: "DELETE",
  });

  if (error.value) {
    toast.error("Une erreur est survenue lors de la suppression de votre compte");
  } else {
    await clear();
    await navigateTo("/auth/login");
    toast.success("Votre compte a été supprimé");
  }
};
</script>

<template>
  <section class="border-t border-red-900/20 pt-8">
    <h2 class="text-2xl font-semibold text-red-500">Zone de danger</h2>
    <p class="text-ui-text-muted">Actions irréversibles concernant votre compte.</p>

    <Card class="mt-6 border-red-900/20">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-ui-text font-medium">Supprimer mon compte</h3>
          <p class="text-ui-text-muted text-sm">
            Toutes vos données et abonnements seront supprimés définitivement.
          </p>
        </div>
        <Button
          label="Supprimer mon compte"
          color="primary"
          class="border-red-500/50 text-red-500 hover:bg-red-500/10"
          @click="on_delete_account"
        />
      </div>
    </Card>
  </section>
</template>
