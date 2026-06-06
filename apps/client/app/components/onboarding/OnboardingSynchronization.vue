<script lang="ts" setup>
import { toast } from "vue-sonner";

const is_syncing = ref(false);

const { fetch } = useUserSession();

const on_sync = async () => {
  const toast_id = toast.loading("Synchronisation en cours", {
    dismissible: false,
    description: "Ne quittez pas cette page, vous serez redirigé automatiquement.",
  });

  is_syncing.value = true;
  await usePost(
    "/api/users/me/onboard",
    {
      key: "onboard_with_sync",
      method: "POST",
      body: { sync: true },
    },
    { immediate: true },
  );
  is_syncing.value = false;

  toast.success("Synchronisation terminée !", { id: toast_id });

  await fetch();

  return navigateTo("/");
};

const on_onboard = async () => {
  await usePost(
    "/api/users/me/onboard",
    {
      key: "onboard_without_sync",
      method: "POST",
      body: { sync: false },
    },
    { immediate: true },
  );

  await fetch();

  return navigateTo("/");
};
</script>

<template>
  <Card class="p-6">
    <div class="mb-6">
      <h2 class="text-ui-text flex items-center gap-2 text-xl font-bold">
        <span
          class="bg-alt/10 text-alt flex size-7 items-center justify-center rounded text-sm font-bold"
        >
          2
        </span>

        Synchronisez vos abonnements
      </h2>

      <p class="text-ui-text-muted mt-2 text-sm">
        Watcher va récupérer automatiquement vos abonnements sur les services connectés ci-dessus
        pour importer les dernières vidéos.
      </p>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Button
        :label="is_syncing ? 'Synchronisation en cours...' : 'Synchroniser mes abonnements'"
        color="secondary"
        size="lg"
        class="w-full sm:w-auto"
        icon="lucide:refresh-cw"
        :loading="is_syncing"
        @click="on_sync"
      />

      <button
        class="text-ui-text-muted hover:text-ui-text cursor-pointer py-2 text-center text-sm font-medium hover:underline"
        @click="on_onboard"
      >
        Passer cette étape pour le moment
      </button>
    </div>
  </Card>
</template>
