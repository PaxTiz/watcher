<script lang="ts" setup>
import { toast } from "vue-sonner";

const { t } = useI18n();

useMeta({ title: () => t("nav.settings") });

const { user, clear } = useUserSession();
const { integrations } = useIntegrations();
const { data: subscriptions } = useSubscriptions();
const themes = useWatcherThemes();
const locales = useWatcherLocales();

const preferences = computed(() => [
  {
    label: t("theme.label"),
    value: themes.colorMode.preference,
    options: themes.options.value,
    select: themes.changeTheme,
  },
  {
    label: t("language.label"),
    value: locales.locale.value,
    options: locales.options,
    select: locales.changeLocale,
  },
]);

const logout = async () => {
  await clear();
  await navigateTo("/auth/login");
};

const delete_account = async () => {
  const ok = await useWatcherConfirm({
    danger: true,
    title: t("settings.delete_account.title"),
    description: t("settings.delete_account.confirm"),
    confirmLabel: t("common.delete"),
  });

  if (!ok) {
    return;
  }

  const { error } = await callApi("/api/auth/delete", { method: "DELETE" });
  if (error) {
    toast.error(t("settings.delete_account.failed"));
    return;
  }

  await clear();
  await navigateTo("/auth/login");
  toast.success(t("settings.delete_account.success"));
};

usePageNavigation()([{ label: t("nav.settings"), icon: "lucide:settings" }]);
</script>

<template>
  <div class="w-full pb-8">
    <h1 class="page-title">{{ t("settings.heading") }}</h1>

    <div class="mt-8 space-y-10">
      <SettingsSection
        :title="t('settings.linked_accounts.title')"
        :description="t('settings.linked_accounts.description')"
      >
        <SettingsIntegrationCard
          v-for="integration in integrations"
          :key="integration.id"
          :integration="integration"
        />
      </SettingsSection>

      <SettingsPasskeys />

      <SettingsSection :title="t('settings.interface')">
        <SettingsRow
          v-for="preference in preferences"
          :key="preference.label"
          :title="preference.label"
        >
          <div
            class="bg-ui-text/[0.06] ring-ui-text/10 inline-flex rounded-full p-1 ring-1 ring-inset"
            role="radiogroup"
            :aria-label="preference.label"
          >
            <button
              v-for="option in preference.options"
              :key="option.value"
              type="button"
              role="radio"
              :aria-checked="preference.value === option.value"
              class="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors"
              :class="
                preference.value === option.value
                  ? 'bg-ui-bg text-ui-text shadow-sm'
                  : 'text-ui-text-muted hover:text-ui-text'
              "
              @click="preference.select(option.value)"
            >
              <Icon :name="option.icon" />
              {{ option.label }}
            </button>
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection :title="t('settings.danger')" danger>
        <SettingsRow :title="user?.name ?? t('settings.heading')">
          <WatcherButton
            :label="t('account.logout')"
            icon="lucide:log-out"
            size="sm"
            @click="logout"
          />
        </SettingsRow>

        <SettingsRow
          :title="t('settings.delete_account.title')"
          :description="t('settings.delete_account.description')"
        >
          <WatcherButton
            :label="t('common.delete')"
            size="sm"
            color="danger"
            @click="delete_account"
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  </div>
</template>
