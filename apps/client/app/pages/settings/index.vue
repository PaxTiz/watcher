<script lang="ts" setup>
import { toast } from "vue-sonner";

useMeta({ title: "Paramètres" });

const { user, clear } = useUserSession();
const { integrations } = useIntegrations();
const { data: subscriptions } = useSubscriptions();
const color_mode = useColorMode();

const themes = [
  { value: "system", label: "Système", icon: "lucide:monitor" },
  { value: "light", label: "Clair", icon: "lucide:sun" },
  { value: "dark", label: "Sombre", icon: "lucide:moon" },
];

const logout = async () => {
  await clear();
  await navigateTo("/auth/login");
};

const delete_account = async () => {
  const ok = await useWatcherConfirm({
    danger: true,
    title: "Supprimer mon compte",
    description:
      "Votre compte, vos abonnements et votre historique seront supprimés définitivement. Cette action est irréversible.",
    confirmLabel: "Supprimer",
    cancelLabel: "Annuler",
  });

  if (!ok) {
    return;
  }

  try {
    await $fetch("/api/auth/delete", { method: "DELETE" });
    await clear();
    await navigateTo("/auth/login");
    toast.success("Votre compte a été supprimé");
  } catch {
    toast.error("La suppression de votre compte a échoué, réessayez plus tard");
  }
};

usePageNavigation()([{ label: "Paramètres", icon: "lucide:settings" }]);
</script>

<template>
  <div class="w-full pb-8">
    <h1 class="page-title">Mon compte</h1>

    <div class="mt-8 space-y-10">
      <SettingsSection
        title="Comptes liés"
        description="Vos abonnements YouTube et Twitch sont récupérés depuis ces comptes."
      >
        <SettingsIntegrationCard
          v-for="integration in integrations"
          :key="integration.id"
          :integration="integration"
        />
      </SettingsSection>

      <SettingsSection title="Apparence">
        <SettingsRow title="Thème">
          <div
            class="bg-ui-text/[0.06] ring-ui-text/10 inline-flex rounded-full p-1 ring-1 ring-inset"
            role="radiogroup"
            aria-label="Thème"
          >
            <button
              v-for="theme in themes"
              :key="theme.value"
              type="button"
              role="radio"
              :aria-checked="color_mode.preference === theme.value"
              class="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors"
              :class="
                color_mode.preference === theme.value
                  ? 'bg-ui-bg text-ui-text shadow-sm'
                  : 'text-ui-text-muted hover:text-ui-text'
              "
              @click="color_mode.preference = theme.value"
            >
              <Icon :name="theme.icon" />
              {{ theme.label }}
            </button>
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Compte">
        <SettingsRow
          :title="user?.name ?? 'Mon compte'"
          :description="user?.bluesky?.handle ? `@${user.bluesky.handle}` : undefined"
        >
          <WatcherButton label="Me déconnecter" icon="lucide:log-out" size="sm" @click="logout" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Zone de danger" danger>
        <SettingsRow
          title="Supprimer mon compte"
          description="Supprime définitivement votre compte, vos abonnements et votre historique."
        >
          <WatcherButton label="Supprimer" size="sm" color="danger" @click="delete_account" />
        </SettingsRow>
      </SettingsSection>
    </div>
  </div>
</template>
