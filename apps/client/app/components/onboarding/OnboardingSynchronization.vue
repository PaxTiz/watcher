<script lang="ts" setup>
import { toast } from "vue-sonner";

const { t } = useI18n();
const { fetch: refresh_session } = useUserSession();
const { error_message, wait_for_sync } = useSynchronization();

const is_syncing = ref(false);
const abort_controller = new AbortController();

const onboard = async (sync: boolean) => {
  const toast_id = sync
    ? toast.loading(t("sync.running"), {
        dismissible: false,
        description: t("onboarding.sync.stay"),
      })
    : undefined;

  is_syncing.value = sync;

  const { error } = await callApi("/api/users/me/onboard", {
    method: "POST",
    body: { sync },
    signal: abort_controller.signal,
  });

  if (error) {
    is_syncing.value = false;
    toast.error(sync ? error_message(error) : t("errors.generic"), { id: toast_id });
    return;
  }

  if (sync) {
    const failure = await wait_for_sync(abort_controller.signal);
    if (failure) {
      toast.error(failure, { id: toast_id });
    } else {
      toast.success(t("sync.done"), { id: toast_id });
    }
  }

  is_syncing.value = false;

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
    :title="t('onboarding.sync.title')"
    :description="t('onboarding.sync.description')"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <WatcherButton
        :label="is_syncing ? t('sync.running') : t('onboarding.sync.action')"
        icon="lucide:refresh-cw"
        color="solid"
        size="lg"
        class="w-full sm:w-auto"
        :loading="is_syncing"
        @click="onboard(true)"
      />
      <WatcherButton
        :label="t('onboarding.sync.later')"
        color="ghost"
        size="lg"
        :disabled="is_syncing"
        @click="onboard(false)"
      />
    </div>
  </OnboardingStep>
</template>
