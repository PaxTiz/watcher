<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <section id="overview" class="bg-ui-bg py-16">
    <div class="container">
      <h2 class="section-title text-left md:text-center">{{ t("platformViewer.title") }}</h2>
      <p class="section-description mt-4 text-left md:text-center">
        {{ t("platformViewer.description") }}
      </p>

      <div
        class="mt-8"
        data-dc-tpl="294"
        style="
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 16px;
          background: repeating-linear-gradient(
            135deg,
            var(--background) 0px,
            var(--background) 14px,
            var(--ui-bg) 14px,
            var(--ui-bg) 28px
          );
          border: 1px solid var(--ui-border);
          box-shadow: rgba(0, 0, 0, 0.2) 0px 24px 48px -18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        "
      >
        <span
          data-dc-tpl="295"
          style="
            font-family: monospace;
            font-size: 13px;
            color: var(--ui-text-muted);
            background: var(--ui-bg);
            padding: 6px 14px;
            border-radius: 8px;
            border: 1px solid var(--ui-border);
          "
          ><span class="sc-interp">{{ t("platformViewer.screenshotAlt") }}</span></span
        >
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
        <div class="inline-flex items-center gap-2">
          <div class="bg-alt h-2 w-2 rounded"></div>
          <span class="text-landing-text text-sm font-bold">
            {{ t("platformViewer.liveBadge") }}
          </span>
        </div>

        <div class="inline-flex items-center gap-2">
          <div class="bg-alt h-2 w-2 rounded"></div>
          <span class="text-landing-text text-sm font-bold">
            {{ t("platformViewer.filters") }}
          </span>
        </div>

        <div class="inline-flex items-center gap-2">
          <div class="bg-alt h-2 w-2 rounded"></div>
          <span class="text-landing-text text-sm font-bold"> {{ t("platformViewer.sync") }} </span>
        </div>
      </div>
    </div>
  </section>
</template>
