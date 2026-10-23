<script lang="ts" setup>
const { t } = useI18n();

const favorites = ["Kiro", "Lune Rouge", "Sol"];
const others: Array<{ name: string; state?: "new" | "hidden" }> = [
  { name: "Nova Plays", state: "new" },
  { name: "Pixel Lab", state: "new" },
  { name: "Atelier Maxence" },
  { name: "Studio Brume", state: "hidden" },
];
</script>

<template>
  <SectionIntro
    id="favorites"
    :title="t('favorites.title')"
    :soft="t('favorites.title_soft')"
    :lead="t('favorites.lead')"
  >
    <div class="mt-10 grid gap-4 md:grid-cols-2" aria-hidden="true">
      <div
        class="bg-ui-bg rounded-[22px] p-[clamp(18px,3vw,32px)] shadow-[0_0_0_1px_var(--ui-border)]"
      >
        <p class="text-ui-text-muted mb-2 text-[11px] tracking-[0.08em] uppercase">
          {{ t("favorites.favorites") }}
        </p>
        <p
          v-for="channel in favorites"
          :key="channel"
          class="text-ui-text flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[14.5px]"
        >
          <span
            class="bg-ui-border text-ui-text-muted grid size-[26px] place-items-center rounded-full font-sans text-[11px] font-semibold"
            >{{ initials(channel) }}</span
          >
          <span class="flex-1">{{ channel }}</span>
          <Icon name="lucide:star" class="text-alt fill-current" />
        </p>
      </div>
      <div
        class="bg-ui-bg rounded-[22px] p-[clamp(18px,3vw,32px)] shadow-[0_0_0_1px_var(--ui-border)]"
      >
        <p class="text-ui-text-muted mb-2 text-[11px] tracking-[0.08em] uppercase">
          {{ t("favorites.subscriptions") }}
        </p>
        <p
          v-for="channel in others"
          :key="channel.name"
          class="flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[14.5px]"
          :class="channel.state === 'hidden' ? 'text-ui-text-muted' : 'text-ui-text'"
        >
          <span
            class="bg-ui-border text-ui-text-muted grid size-[26px] place-items-center rounded-full font-sans text-[11px] font-semibold"
            :class="{ 'opacity-50': channel.state === 'hidden' }"
          >
            {{ initials(channel.name) }}
          </span>
          <span class="flex-1">{{ channel.name }}</span>
          <span v-if="channel.state === 'new'" class="bg-alt size-[7px] rounded-full" />
          <span
            v-else-if="channel.state === 'hidden'"
            class="text-ui-text-muted flex items-center gap-1.5 font-sans text-xs"
          >
            <Icon name="lucide:eye-off" />
            {{ t("favorites.hidden") }}
          </span>
        </p>
      </div>
    </div>
  </SectionIntro>
</template>
