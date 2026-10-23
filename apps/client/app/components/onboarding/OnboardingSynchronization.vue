<script lang="ts" setup>
import { toast } from "vue-sonner";

const { t } = useI18n();
const { fetch: refresh_session } = useUserSession();

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

  is_syncing.value = false;

  if (error) {
    toast.error(t("errors.generic"), { id: toast_id });
    return;
  }

  if (sync) {
    toast.success(t("sync.done"), { id: toast_id });
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
