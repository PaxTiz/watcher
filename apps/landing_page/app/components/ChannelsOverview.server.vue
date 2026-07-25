<script lang="ts" setup>
const VideoCard = defineComponent<{
  platform: "youtube" | "twitch";
  title: string;
  badge: { type: "live" | "duration"; label: string };
}>(
  (props) => {
    const platformColor = props.platform === "twitch" ? "rgb(145, 70, 255)" : "rgb(255, 0, 0)";
    const platformLabel = props.platform === "twitch" ? "Twitch" : "YouTube";

    return () =>
      h(
        "div",
        {
          class:
            "video-card flex-shrink-0 w-[200px] rounded-xl border border-ui-border bg-ui-bg overflow-hidden shadow-[0_10px_24px_-14px_rgba(0,0,0,0.25)]",
        },
        [
          h("div", { class: "video-card__thumb relative h-[110px] bg-background" }, [
            props.badge.type === "live"
              ? h(
                  "span",
                  {
                    class:
                      "absolute top-2 left-2 rounded bg-[rgb(145,70,255)] px-1.5 py-0.5 text-[10px] font-extrabold text-white",
                  },
                  "LIVE",
                )
              : h(
                  "span",
                  {
                    class:
                      "absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white",
                  },
                  props.badge.label,
                ),
          ]),
          h("div", { class: "flex items-center gap-2 p-2.5" }, [
            h("div", {
              class: "h-5 w-5 flex-shrink-0 rounded-md",
              style: { background: platformColor },
            }),
            h("div", [
              h("p", { class: "m-0 text-xs font-extrabold text-ui-text" }, props.title),
              h("p", { class: "m-0 text-[11px] text-ui-text-muted" }, platformLabel),
            ]),
          ]),
        ],
      );
  },
  { props: ["platform", "title", "badge"] },
);

const todayVideos = [
  { platform: "twitch", title: "Session ranked", badge: { type: "live" } },
  { platform: "youtube", title: "Best moments #12", badge: { type: "duration", label: "18:42" } },
  { platform: "twitch", title: "Just chatting", badge: { type: "live" } },
  { platform: "youtube", title: "VOD complet", badge: { type: "duration", label: "1:02:31" } },
  { platform: "twitch", title: "Speedrun%", badge: { type: "live" } },
];

const yesterdayVideos = [
  { platform: "youtube", title: "Let's play ep.4", badge: { type: "duration", label: "42:10" } },
  { platform: "twitch", title: "Draft du soir", badge: { type: "live" } },
  { platform: "youtube", title: "Réaction — clip", badge: { type: "duration", label: "08:55" } },
  { platform: "twitch", title: "Co-op du dimanche", badge: { type: "live" } },
  {
    platform: "youtube",
    title: "Résumé de la semaine",
    badge: { type: "duration", label: "31:20" },
  },
];
</script>

<template>
  <section class="bg-ui-bg border-ui-border border-t py-16">
    <div class="container">
      <h2 class="section-title text-left md:text-center">Tous tes abonnements au même endroit</h2>
      <p class="section-description mt-4 text-left md:text-center">
        Watcher regroupe l'ensemble des vidéos YouTube de Twitch de tous tes créateurs préférés dans
        un seul et même flux unifié.
      </p>

      <section class="mt-8">
        <div class="marquee-viewport">
          <div class="marquee-track marquee-track--left">
            <div class="marquee-group">
              <VideoCard v-for="(video, i) in todayVideos" :key="`today-${i}`" v-bind="video" />
            </div>
            <div class="marquee-group" aria-hidden="true">
              <VideoCard v-for="(video, i) in todayVideos" :key="`today-dup-${i}`" v-bind="video" />
            </div>
          </div>
        </div>
      </section>

      <section class="mt-8">
        <div class="marquee-viewport">
          <div class="marquee-track marquee-track--right">
            <div class="marquee-group">
              <VideoCard
                v-for="(video, i) in yesterdayVideos"
                :key="`yesterday-${i}`"
                v-bind="video"
              />
            </div>
            <div class="marquee-group" aria-hidden="true">
              <VideoCard
                v-for="(video, i) in yesterdayVideos"
                :key="`yesterday-dup-${i}`"
                v-bind="video"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.marquee-viewport {
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
}

.marquee-track {
  display: flex;
  gap: 16px;
  width: max-content;
}

.marquee-track--left {
  animation: marquee-left 34s linear infinite;
}

.marquee-track--right {
  animation: marquee-right 34s linear infinite;
}

.marquee-track:hover {
  animation-play-state: paused;
}

.marquee-group {
  display: flex;
  gap: 16px;
}

@keyframes marquee-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes marquee-right {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
</style>
