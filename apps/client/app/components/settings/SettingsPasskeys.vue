<script lang="ts" setup>
import type { PasskeyResource } from "@watcher/common";
import { toast } from "vue-sonner";

import { LazyPasskeyNameModal } from "#components";

const { t } = useI18n();
const { user } = useUserSession();
const { add, loading, is_supported } = usePasskeys();
const { dates } = useFormatter();
const overlay = useWatcherOverlay();

const { data, refresh } = useAppFetch<Array<PasskeyResource>>("/api/passkeys", {
  key: "passkeys",
});
const passkeys = computed(() => data.value ?? []);

const on_add = async () => {
  const name = await overlay.create(LazyPasskeyNameModal).open({
    title: t("passkeys.add.title"),
    confirmLabel: t("common.continue"),
  }).result;

  if (!name) {
    return;
  }

  if (await add(user.value?.name ?? "Watcher", name)) {
    await refresh();
    toast.success(t("passkeys.add.success"));
  }
};

const on_rename = async (passkey: PasskeyResource) => {
  const name = await overlay.create(LazyPasskeyNameModal).open({
    title: t("passkeys.rename.title"),
    confirmLabel: t("common.save"),
    name: passkey.name,
  }).result;

  if (!name) {
    return;
  }

  const { error } = await callApi(`/api/passkeys/${encodeURIComponent(passkey.id)}`, {
    method: "PATCH",
    body: { name },
  });
  if (error) {
    toast.error(t("passkeys.rename.failed"));
    return;
  }

  await refresh();
  toast.success(t("passkeys.rename.success"));
};

const on_delete = async (passkey: PasskeyResource) => {
  const ok = await useWatcherConfirm({
    danger: true,
    title: t("passkeys.delete.title"),
    description: t("passkeys.delete.description"),
    confirmLabel: t("common.delete"),
  });

  if (!ok) {
    return;
  }

  const { error } = await callApi(`/api/passkeys/${encodeURIComponent(passkey.id)}`, {
    method: "DELETE",
  });
  if (error) {
    toast.error(
      t(
        error.message === "last_login_method"
          ? "passkeys.delete.last_login_method"
          : "passkeys.delete.failed",
      ),
    );
    return;
  }

  await refresh();
  toast.success(t("passkeys.delete.success"));
};
</script>

<template>
  <SettingsSection :title="t('passkeys.title')" :description="t('passkeys.description')">
    <SettingsRow v-for="passkey in passkeys" :key="passkey.id" :title="passkey.name">
      <template #icon>
        <span
          class="bg-ui-text/[0.06] text-ui-text flex size-10 shrink-0 items-center justify-center rounded-xl"
        >
          <Icon name="lucide:key-round" class="text-lg" />
        </span>
      </template>

      <template #description>
        {{ t("passkeys.added_on", { date: dates.format(passkey.created_at) }) }}
        <template v-if="passkey.last_used_at">
          · {{ t("passkeys.used_ago", { ago: dates.ago(passkey.last_used_at) }) }}
        </template>
      </template>

      <WatcherButton
        :label="t('common.rename')"
        size="sm"
        color="ghost"
        @click="on_rename(passkey)"
      />
      <WatcherButton
        :label="t('common.delete')"
        size="sm"
        color="ghost"
        @click="on_delete(passkey)"
      />
    </SettingsRow>

    <SettingsRow
      :title="t('passkeys.add.title')"
      :description="t(is_supported ? 'passkeys.add.supported' : 'passkeys.add.unsupported')"
    >
      <WatcherButton
        :label="t('common.add')"
        icon="lucide:plus"
        size="sm"
        color="solid"
        :loading="loading"
        :disabled="!is_supported"
        @click="on_add"
      />
    </SettingsRow>
  </SettingsSection>
</template>
