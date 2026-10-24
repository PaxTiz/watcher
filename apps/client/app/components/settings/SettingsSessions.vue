<script lang="ts" setup>
import type { SessionResource } from "@watcher/common";
import { toast } from "vue-sonner";

const { t } = useI18n();
const { dates } = useFormatter();

const { data, refresh } = useAppFetch<Array<SessionResource>>("/api/sessions", {
  key: "sessions",
});

const DEVICE_ICONS = {
  desktop: "lucide:monitor",
  mobile: "lucide:smartphone",
  tablet: "lucide:tablet",
} as const;

const LOGIN_METHODS = {
  google: "YouTube",
  twitch: "Twitch",
} as const;

const sessions = computed(() =>
  (data.value ?? []).map((session) => {
    const device = parseUserAgent(session.user_agent);

    return {
      ...session,
      icon: DEVICE_ICONS[device.type],
      name: [device.browser, device.os].filter(Boolean).join(" · ") || t("sessions.unknown_device"),
      method:
        session.login_with === "passkey"
          ? t("sessions.passkey")
          : LOGIN_METHODS[session.login_with],
    };
  }),
);

const has_other_sessions = computed(() => sessions.value.some((session) => !session.is_current));

const on_revoke = async (session: Pick<SessionResource, "id">) => {
  const ok = await useWatcherConfirm({
    danger: true,
    title: t("sessions.revoke.title"),
    description: t("sessions.revoke.description"),
    confirmLabel: t("sessions.revoke.action"),
  });

  if (!ok) {
    return;
  }

  const { error } = await callApi(`/api/sessions/${session.id}`, { method: "DELETE" });
  if (error) {
    toast.error(t("sessions.revoke.failed"));
    return;
  }

  await refresh();
  toast.success(t("sessions.revoke.success"));
};

const on_revoke_others = async () => {
  const ok = await useWatcherConfirm({
    danger: true,
    title: t("sessions.revoke_others.title"),
    description: t("sessions.revoke_others.description"),
    confirmLabel: t("sessions.revoke.action"),
  });

  if (!ok) {
    return;
  }

  const { error } = await callApi("/api/sessions", { method: "DELETE" });
  if (error) {
    toast.error(t("sessions.revoke_others.failed"));
    return;
  }

  await refresh();
  toast.success(t("sessions.revoke_others.success"));
};
</script>

<template>
  <SettingsSection :title="t('sessions.title')" :description="t('sessions.description')">
    <SettingsRow v-for="session in sessions" :key="session.id" :title="session.name">
      <template #icon>
        <span
          class="bg-ui-text/[0.06] text-ui-text flex size-10 shrink-0 items-center justify-center rounded-xl"
        >
          <Icon :name="session.icon" class="text-lg" />
        </span>
      </template>

      <template #description>
        <template v-if="session.is_current">{{ t("sessions.current") }}</template>
        <template v-else>
          {{ t("sessions.active_ago", { ago: dates.ago(session.last_seen_at) }) }}
        </template>
        · {{ t("sessions.signed_in_with", { method: session.method }) }}
      </template>

      <WatcherButton
        v-if="!session.is_current"
        :label="t('sessions.revoke.action')"
        size="sm"
        color="ghost"
        @click="on_revoke(session)"
      />
    </SettingsRow>

    <SettingsRow
      v-if="has_other_sessions"
      :title="t('sessions.revoke_others.title')"
      :description="t('sessions.revoke_others.hint')"
    >
      <WatcherButton
        :label="t('sessions.revoke.action')"
        icon="lucide:log-out"
        size="sm"
        @click="on_revoke_others"
      />
    </SettingsRow>
  </SettingsSection>
</template>
