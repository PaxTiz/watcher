<script lang="ts" setup>
import { toast } from "vue-sonner";

const { fetch: refresh_session } = useUserSession();

const is_syncing = ref(false);
const abort_controller = new AbortController();

const onboard = async (sync: boolean) => {
  const toast_id = sync
    ? toast.loading("Synchronisation en cours", {
        dismissible: false,
        description: "Restez sur cette page, vous serez redirigé automatiquement.",
      })
    : undefined;

  is_syncing.value = sync;

  const { error } = await callApi("/api/users/me/onboard", {
    method: "POST",
    body: { sync },
    signal: abort_controller.signal,
  });

  is_syncing.value = false;

  if (error) {
    toast.error("Une erreur est survenue, réessayez dans quelques instants", { id: toast_id });
    return;
  }

  if (sync) {
    toast.success("Synchronisation terminée", { id: toast_id });
  }

  await refresh_session();
  await navigateTo("/");
};

onUnmounted(() => {
  abort_controller.abort();
});
</script>

<template>
  <OnboardingStep
    :step="2"
    title="Synchronisez vos abonnements"
    description="Watcher récupère vos abonnements sur les comptes associés et importe leurs dernières vidéos."
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <WatcherButton
        :label="is_syncing ? 'Synchronisation en cours…' : 'Synchroniser mes abonnements'"
        icon="lucide:refresh-cw"
        color="solid"
        size="lg"
        class="w-full sm:w-auto"
        :loading="is_syncing"
        @click="onboard(true)"
      />
      <WatcherButton
        label="Plus tard"
        color="ghost"
        size="lg"
        :disabled="is_syncing"
        @click="onboard(false)"
      />
    </div>
  </OnboardingStep>
</template>
