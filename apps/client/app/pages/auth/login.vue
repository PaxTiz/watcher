<script lang="ts" setup>
import { LazyPasskeySignupModal } from "#components";

definePageMeta({ layout: "auth" });

const { t } = useI18n();
const { loggedIn } = useUserSession();
if (loggedIn.value) {
  await navigateTo("/");
}

const overlay = useWatcherOverlay();
const { login: loginWithPasskey, loading: passkeyLoading } = usePasskeys();

const onLoginWithPasskey = async () => {
  if (await loginWithPasskey()) {
    await navigateTo("/");
  }
};

const onShowPasskeySignupModal = () => {
  overlay.create(LazyPasskeySignupModal).open();
};

const benefits = computed(() => [
  { icon: "lucide:layers", text: t("auth.benefits.feed") },
  { icon: "lucide:list-ordered", text: t("auth.benefits.order") },
  { icon: "lucide:history", text: t("auth.benefits.resume") },
]);

useMeta({ title: () => t("auth.title") });
</script>

<template>
  <section>
    <WatcherLogo class="h-7" />

    <h1
      class="font-display text-ui-text mt-12 text-3xl leading-tight font-medium text-balance md:text-4xl"
    >
      {{ t("auth.headline") }}
    </h1>

    <ul class="mt-6 space-y-3">
      <li
        v-for="benefit in benefits"
        :key="benefit.icon"
        class="text-ui-text-muted flex gap-3 text-[15px]"
      >
        <Icon :name="benefit.icon" class="text-alt mt-0.5 shrink-0 text-lg" />
        {{ benefit.text }}
      </li>
    </ul>

    <div class="mt-10 space-y-2.5">
      <WatcherButton
        to="/api/oauth/google"
        :label="t('auth.google')"
        icon="fa7-brands:youtube"
        size="lg"
        color="solid"
        class="w-full"
        external
      />
      <div class="grid grid-cols-2 gap-2.5">
        <WatcherButton
          to="/api/oauth/twitch"
          label="Twitch"
          icon="fa7-brands:twitch"
          size="lg"
          class="w-full [&_svg]:text-[#a970ff]"
          external
        />
        <WatcherButton
          :label="t('auth.passkey')"
          icon="lucide:key-round"
          size="lg"
          class="w-full"
          :loading="passkeyLoading"
          @click="onLoginWithPasskey"
        />
      </div>
    </div>

    <p class="text-ui-text-muted mt-4 text-center text-[13px]">
      {{ t("auth.no_account") }}
      <button
        type="button"
        class="text-ui-text font-medium underline-offset-4 hover:underline"
        @click="onShowPasskeySignupModal"
      >
        {{ t("auth.signup_with_passkey") }}
      </button>
    </p>

    <p class="text-ui-text-muted mt-6 flex items-center gap-2 text-[13px]">
      <Icon name="lucide:lock" class="shrink-0" />
      {{ t("auth.read_only") }}
    </p>
  </section>
</template>
