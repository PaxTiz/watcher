<script lang="ts" setup>
import {
  type SubscriptionResource,
  type VideoCurrentRefreshType,
  type VideoPalette,
  VIDEO_CURRENT_REFRESH_SYMBOL,
} from "@watcher/common";
import { toast } from "vue-sonner";

const { subscription } = defineProps<{
  subscription: SubscriptionResource;
  totalVideos?: number;
  palette?: VideoPalette | null;
}>();

const refresh = inject<VideoCurrentRefreshType>(VIDEO_CURRENT_REFRESH_SYMBOL);
const { forceRefresh: refresh_subscriptions } = useSubscriptions();
const { dates } = useFormatter();

const service_name = computed(() =>
  subscription.channel.service === "youtube" ? "YouTube" : "Twitch",
);

const is_favorite_pending = ref(false);
const is_hidden_pending = ref(false);

const toggle_favorite = async () => {
  const was_favorite = subscription.is_favorite;

  is_favorite_pending.value = true;
  const { error } = await callApi(`/api/subscriptions/${subscription.id}/favorite`, {
    method: "POST",
  });
  is_favorite_pending.value = false;

  if (error) {
    toast.error("La modification de vos favoris a échoué, réessayez plus tard");
    return;
  }

  await Promise.all([refresh?.(), refresh_subscriptions()]);

  toast.success(
    was_favorite
      ? `${subscription.name} a été retiré de vos favoris`
      : `${subscription.name} a été ajouté à vos favoris`,
  );
};

const toggle_hidden = async () => {
  if (!subscription.is_hidden) {
    const ok = await useWatcherConfirm({
      title: "Masquer la chaîne",
      description: `Les vidéos de ${subscription.name} n'apparaîtront plus dans votre flux. Vous pourrez la réafficher depuis cette page.`,
      confirmLabel: "Masquer",
      cancelLabel: "Annuler",
    });
    if (!ok) {
      return;
    }
  }

  const action = subscription.is_hidden ? "show" : "hide";

  is_hidden_pending.value = true;
  const { error } = await callApi(`/api/subscriptions/${subscription.id}/${action}`, {
    method: "POST",
  });
  is_hidden_pending.value = false;

  if (error) {
    toast.error("La modification de la chaîne a échoué, réessayez plus tard");
    return;
  }

  await Promise.all([refresh?.(), refresh_subscriptions()]);
};
</script>

<template>
  <header
    class="video-tinted relative isolate overflow-hidden rounded-3xl p-5 shadow-[0_0_0_1px_var(--ui-border)] md:p-7 dark:shadow-[inset_0_0_0_1px_rgb(var(--c-light)/0.1)]"
    :style="video_tones_style(palette)"
  >
    <div
      class="pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-100"
      :style="{ backgroundImage: palette_light(palette, 0.32) }"
    />

    <div class="flex flex-col gap-5 md:flex-row md:items-center">
      <NuxtImg
        class="size-20 shrink-0 rounded-full object-cover shadow-[0_0_0_3px_var(--background),0_0_0_4.5px_rgb(var(--c)/0.7)] md:size-24"
        format="avif,webp"
        width="96"
        height="96"
        :src="subscription.channel.logo"
        :alt="`Logo de ${subscription.name}`"
      />

      <div class="min-w-0 flex-1">
        <h1 class="page-title truncate md:text-3xl">{{ subscription.name }}</h1>

        <p class="text-ui-text-muted mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span class="text-ui-text inline-flex items-center gap-1.5">
            <Icon
              :name="
                subscription.channel.service === 'youtube'
                  ? 'fa7-brands:youtube'
                  : 'fa7-brands:twitch'
              "
              :class="
                subscription.channel.service === 'youtube' ? 'text-[#ff0033]' : 'text-[#9146ff]'
              "
            />
            {{ service_name }}
          </span>
          <template v-if="totalVideos !== undefined">
            <span aria-hidden="true">·</span>
            <span>{{ totalVideos }} vidéo{{ totalVideos > 1 ? "s" : "" }}</span>
          </template>
          <template v-if="subscription.last_video_at">
            <span aria-hidden="true">·</span>
            <span>Dernière vidéo {{ dates.ago(subscription.last_video_at) }}</span>
          </template>
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <WatcherButton
          :color="subscription.is_favorite ? 'neutral' : 'solid'"
          :icon="subscription.is_favorite ? 'lucide:star-off' : 'lucide:star'"
          :label="subscription.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          :loading="is_favorite_pending"
          :disabled="subscription.is_hidden"
          @click="toggle_favorite"
        />
        <WatcherButton
          :icon="subscription.is_hidden ? 'lucide:eye' : 'lucide:eye-off'"
          :label="subscription.is_hidden ? 'Réafficher' : 'Masquer'"
          :loading="is_hidden_pending"
          @click="toggle_hidden"
        />
        <WatcherButton
          icon="lucide:external-link"
          :label="`Ouvrir sur ${service_name}`"
          :to="subscription.channel.url"
          external
          new-tab
        />
      </div>
    </div>

    <p
      v-if="subscription.is_hidden"
      class="text-ui-text-muted bg-ui-text/[0.05] mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm"
    >
      <Icon name="lucide:eye-off" class="shrink-0" />
      Cette chaîne est masquée : ses vidéos n'apparaissent pas dans votre flux.
    </p>
  </header>
</template>
