<script lang="ts" setup>
import type { PasskeyResource } from "@watcher/common";
import { toast } from "vue-sonner";

import { LazyPasskeyNameModal } from "#components";

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
    title: "Ajouter une clé d'accès",
    confirmLabel: "Continuer",
  }).result;

  if (!name) {
    return;
  }

  if (await add(user.value?.name ?? "Watcher", name)) {
    await refresh();
    toast.success("Votre clé d'accès a été ajoutée");
  }
};

const on_rename = async (passkey: PasskeyResource) => {
  const name = await overlay.create(LazyPasskeyNameModal).open({
    title: "Renommer la clé d'accès",
    confirmLabel: "Enregistrer",
    name: passkey.name,
  }).result;

  if (!name) {
    return;
  }

  try {
    await $fetch(`/api/passkeys/${encodeURIComponent(passkey.id)}`, {
      method: "PATCH",
      body: { name },
    });
    await refresh();
    toast.success("La clé d'accès a été renommée");
  } catch {
    toast.error("Le renommage de la clé d'accès a échoué, réessayez plus tard");
  }
};

const on_delete = async (passkey: PasskeyResource) => {
  const ok = await useWatcherConfirm({
    danger: true,
    title: "Supprimer cette clé d'accès",
    description:
      "Vous ne pourrez plus vous connecter à Watcher avec cette clé d'accès. Pensez également à la supprimer de votre appareil ou de votre gestionnaire de mots de passe.",
    confirmLabel: "Supprimer",
    cancelLabel: "Annuler",
  });

  if (!ok) {
    return;
  }

  try {
    await $fetch(`/api/passkeys/${encodeURIComponent(passkey.id)}`, { method: "DELETE" });
    await refresh();
    toast.success("La clé d'accès a été supprimée");
  } catch (error) {
    const is_last =
      (error as { data?: { message?: string } }).data?.message === "last_login_method";

    toast.error(
      is_last
        ? "Associez un compte ou une autre clé d'accès avant de supprimer celle-ci"
        : "La suppression de la clé d'accès a échoué, réessayez plus tard",
    );
  }
};
</script>

<template>
  <SettingsSection
    title="Clés d'accès"
    description="Connectez-vous avec l'empreinte, le visage ou le code de votre appareil."
  >
    <SettingsRow v-for="passkey in passkeys" :key="passkey.id" :title="passkey.name">
      <template #icon>
        <span
          class="bg-ui-text/[0.06] text-ui-text flex size-10 shrink-0 items-center justify-center rounded-xl"
        >
          <Icon name="lucide:key-round" class="text-lg" />
        </span>
      </template>

      <template #description>
        Ajoutée le {{ dates.format(passkey.created_at) }}
        <template v-if="passkey.last_used_at">
          · Utilisée {{ dates.ago(passkey.last_used_at) }}
        </template>
      </template>

      <WatcherButton label="Renommer" size="sm" color="ghost" @click="on_rename(passkey)" />
      <WatcherButton label="Supprimer" size="sm" color="ghost" @click="on_delete(passkey)" />
    </SettingsRow>

    <SettingsRow
      title="Ajouter une clé d'accès"
      :description="
        is_supported
          ? 'Enregistrez une clé d\'accès sur cet appareil.'
          : 'Votre navigateur ne prend pas en charge les clés d\'accès.'
      "
    >
      <WatcherButton
        label="Ajouter"
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
