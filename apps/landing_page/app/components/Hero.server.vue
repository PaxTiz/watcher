<template>
  <section class="bg-background pt-28 pb-8 sm:pt-36">
    <div class="container flex flex-col gap-4">
      <div class="video-container aspect-auto md:aspect-video">
        <div class="video-background">
          <div class="video-background__dots"></div>
        </div>

        <div class="video-header">
          <div class="video-live">En direct</div>
        </div>

        <div class="video-body py-12 md:py-0">
          <h1 class="page-title text-left md:text-center">
            Retrouve tous tes <span class="text-alt">créateurs préférés</span> réunis dans un seul
            <span class="text-alt">flux unifié</span>
          </h1>

          <p class="mt-4 text-left text-lg text-gray-300 md:text-center">
            Watcher réunit tes abonnements Twitch et YouTube dans une interface unique. Plus besoin
            de jongler entre les plateformes pour ne rien rater.
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-start gap-4 md:justify-center">
            <WatcherButton
              label="Commencer"
              color="secondary"
              size="lg"
              icon="lucide:play"
              icon-size="lg"
              class="font-bold"
            />

            <WatcherButton label="Voir la démo" size="lg" color="glass" class="font-bold" />
          </div>
        </div>

        <div class="video-footer">
          <div class="video-progress">
            <div class="video-progress__head"></div>
            <div class="video-progress__fill"></div>
          </div>

          <div class="video-actions">
            <div class="video-actions__left">
              <Icon name="lucide:play" />

              <div class="video-sound">
                <Icon name="lucide:volume-2" />

                <div class="video-sound__slider">
                  <div class="video-sound__slider-fill"></div>
                  <div class="video-sound__slider-head"></div>
                </div>
              </div>
            </div>

            <div class="video-actions__right">
              <Icon name="lucide:settings" />
              <Icon name="lucide:maximize-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.video-container {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius);
  background: linear-gradient(160deg, var(--color-slate-800) 0%, var(--color-slate-900) 75%);
}

.video-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--radius);
}

.video-background__dots {
  position: absolute;
  inset: 0;
  opacity: 0.6;
  mix-blend-mode: overlay;
  background-image: radial-gradient(rgba(255, 255, 255, 0.5) 2px, transparent 2px);
  background-size: 16px 16px;
  animation: video-dots-drift 1.2s linear infinite;
  -webkit-mask-image: radial-gradient(circle at 50% 45%, black 0%, black 35%, transparent 72%);
  mask-image: radial-gradient(circle at 50% 45%, black 0%, black 35%, transparent 72%);
}

.video-header {
  padding: calc(var(--spacing) * 5);

  .video-live {
    position: relative;
    border-radius: var(--radius);
    background: var(--color-background-dark);
    color: var(--color-white);
    padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2) calc(var(--spacing) * 1)
      calc(var(--spacing) * 5);
    width: fit-content;
    font-weight: 600;
    font-size: var(--text-xs);
    text-transform: uppercase;

    &::before {
      content: "";
      width: 8px;
      height: 8px;
      background-color: var(--color-alt);
      border-radius: 50%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 0.5rem;
    }
  }
}

.video-body {
  z-index: 9;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 75%;
  margin: 0 auto;
}

.video-footer {
  z-index: 1;
  position: relative;
  padding: calc(var(--spacing) * 5);

  &::before {
    content: "";
    position: absolute;
    inset: -40px 0 0 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
    pointer-events: none;
    border-bottom-left-radius: var(--radius);
    border-bottom-right-radius: var(--radius);
    z-index: -1;
  }

  .video-progress {
    width: 100%;
    height: 5px;
    border-radius: var(--radius);
    background-color: var(--color-slate-600);
    position: relative;
  }

  .video-progress__head {
    position: absolute;
    top: 50%;
    width: 11px;
    height: 11px;
    background-color: var(--color-white);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: video-progress-head 45s linear infinite;
  }

  .video-progress__fill {
    height: 100%;
    background-color: var(--color-alt);
    border-radius: var(--radius);
    animation: video-progress-fill 45s linear infinite;
  }

  .video-actions {
    margin-top: calc(var(--spacing) * 3);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .video-actions__left,
  .video-actions__right {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 6);
    color: #fff;
    font-size: 1.2rem;
  }

  .video-sound {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 2);
  }

  .video-sound__slider {
    position: relative;
    width: 70px;
    height: 3px;
    border-radius: var(--radius);
    background-color: rgba(255, 255, 255, 0.3);
    overflow: visible;
  }

  .video-sound__slider-fill {
    height: 100%;
    width: 70%;
    background-color: var(--color-white);
    border-radius: var(--radius);
  }

  .video-sound__slider-head {
    position: absolute;
    top: 50%;
    left: 70%;
    width: 9px;
    height: 9px;
    background-color: var(--color-white);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}

@keyframes video-dots-drift {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 16px 16px;
  }
}

@keyframes video-progress-fill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@keyframes video-progress-head {
  from {
    left: 0%;
  }
  to {
    left: 100%;
  }
}
</style>
