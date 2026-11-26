<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <section
    aria-labelledby="cta-title"
    class="bg-alt flex flex-col items-center gap-5 overflow-hidden rounded-3xl px-[clamp(24px,6vw,72px)] py-[clamp(40px,7vw,96px)] text-center"
  >
    <h2
      id="cta-title"
      class="section-title max-w-[820px] text-[clamp(30px,4.6vw,64px)] text-[#121521]"
    >
      {{ t("cta.title") }}
    </h2>
    <p class="m-0 text-[17px] text-[#121521]">{{ t("cta.note") }}</p>
    <SignInButtons variant="cta" class="mt-1.5" />
  </section>
</template>
