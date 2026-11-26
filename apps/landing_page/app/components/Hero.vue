<script lang="ts" setup>
const { t } = useI18n();

const ROWS = [
  { key: "favorites", videos: [VIDEOS.ice, VIDEOS.notes, VIDEOS.synth, VIDEOS.scope] },
  { key: "yesterday", videos: [VIDEOS.rediff, VIDEOS.cook, VIDEOS.plant] },
] as const;

const visibility = (index: number) =>
  index === 2 ? "max-sm:hidden" : index === 3 ? "max-[1099px]:hidden" : "";
</script>

<template>
  <section id="home" aria-labelledby="home-title" class="flex flex-col gap-7">
    <div class="grid gap-10 pt-[clamp(24px,5vw,72px)] min-[960px]:gap-16">
      <div class="mx-auto flex max-w-[1120px] flex-col items-center gap-6 text-center">
        <h1
          id="home-title"
          class="font-display text-ui-text m-0 text-[clamp(34px,9vw,60px)] leading-[1.02] font-medium tracking-[-0.035em] text-balance min-[960px]:text-[clamp(40px,5.6vw,88px)]"
        >
          {{ t("hero.title") }}
          <span class="text-alt">{{ t("hero.title_accent") }}</span>
        </h1>
        <p
          class="text-ui-text-muted m-0 max-w-[640px] text-[clamp(17px,1.5vw,21px)] leading-[1.55] text-pretty"
        >
          {{ t("hero.lead") }}
        </p>
        <SignInButtons id="join" class="mt-1.5" />
        <span class="text-ui-text-muted text-sm">{{ t("hero.note") }}</span>
      </div>

      <div
        class="hero-stage bg-alt relative rounded-3xl p-[clamp(16px,4vw,32px)] min-[960px]:px-[clamp(40px,9vw,150px)] min-[960px]:py-18"
      >
        <div
          role="img"
          :aria-label="t('hero.preview_label')"
          class="hero-preview bg-frame overflow-hidden rounded-3xl border border-[var(--panel-edge)] shadow-[0_1px_2px_rgba(18,21,33,0.1),0_40px_80px_-40px_rgba(18,21,33,0.5)]"
        >
          <div
            aria-hidden="true"
            class="bg-background m-2 flex min-w-0 flex-col gap-6.5 rounded-2xl p-[clamp(14px,2vw,22px)]"
          >
            <div v-for="row in ROWS" :key="row.key" class="flex flex-col gap-3.5">
              <div class="flex items-baseline gap-2.5">
                <span class="text-ui-text text-[17px] font-bold">
                  <template v-if="row.key === 'favorites'">
                    <span class="text-highlight">★</span>&nbsp;{{ t("preview.favorites_new") }}
                  </template>
                  <template v-else>{{ t("preview.yesterday") }}</template>
                </span>
                <span v-if="row.key === 'favorites'" class="text-ui-text-muted text-[13px]">
                  {{ t("preview.see_all") }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 min-[1100px]:grid-cols-4 sm:grid-cols-3">
                <div
                  v-for="(video, index) in row.videos"
                  :key="video.key"
                  class="hero-card"
                  :class="visibility(index)"
                  :style="{ '--i': index }"
                >
                  <VideoCard :video="video" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes hero-stage-unfold {
  from {
    clip-path: inset(0 7% round 56px);
  }
  to {
    clip-path: inset(0 0 round 24px);
  }
}

@keyframes hero-preview-rise {
  from {
    transform: perspective(1200px) translateY(-24px) rotateX(32deg) scale(0.8);
    box-shadow: 0 0 0 rgba(18, 21, 33, 0);
  }
  to {
    transform: none;
  }
}

@keyframes hero-card-in {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.hero-preview {
  transform-origin: 50% 0;
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .hero-stage {
      animation: hero-stage-unfold both cubic-bezier(0.2, 0.7, 0.2, 1);
      animation-timeline: scroll(root);
      animation-range: 0 55vh;
    }

    .hero-preview {
      animation: hero-preview-rise both cubic-bezier(0.2, 0.7, 0.2, 1);
      animation-timeline: scroll(root);
      animation-range: 0 75vh;
    }

    .hero-card {
      animation: hero-card-in both cubic-bezier(0.2, 0.7, 0.2, 1);
      animation-timeline: view();
      animation-range: entry calc(var(--i) * 12%) cover calc(25% + var(--i) * 6%);
    }
  }
}
</style>
