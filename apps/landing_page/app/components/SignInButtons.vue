<script lang="ts" setup>
const { variant = "hero" } = defineProps<{ variant?: "hero" | "cta" }>();

const { t } = useI18n();
const { appUrl } = useRuntimeConfig().public;

const providers = [
  { key: "twitch", href: "/api/oauth/twitch", color: "#9146ff" },
  { key: "youtube", href: "/api/oauth/google", color: "#ff0033" },
] as const;
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2.5">
    <a
      v-for="(provider, index) in providers"
      :key="provider.key"
      :href="`${appUrl}${provider.href}`"
      class="flex h-[50px] items-center gap-2.5 rounded-full px-6 text-base font-semibold transition-colors"
      :class="
        variant === 'cta'
          ? 'bg-[#121521] text-[#fafafb] hover:bg-[#2a2f45] hover:text-[#fafafb]'
          : index === 0
            ? 'bg-ui-text text-ui-bg hover:text-ui-bg hover:bg-[color-mix(in_oklab,var(--ui-text)_85%,white)]'
            : 'liquid-glass text-ui-text hover:text-ui-text'
      "
    >
      <span class="size-[9px] rounded-[3px]" :style="{ background: provider.color }" />
      {{ t(`sign_in.${provider.key}`) }}
    </a>
  </div>
</template>
