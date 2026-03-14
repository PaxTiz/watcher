<script lang="ts" setup>
import useEmblaCarousel from "embla-carousel-vue";

import type { SubscriptionResource } from "#shared/resources/subscriptions";

defineProps<{ subscriptions: Array<SubscriptionResource> }>();

const [emblaRef, emblaApi] = useEmblaCarousel({
  loop: true,
  align: "start",
  slidesToScroll: "auto",
  duration: 60,
});

const goToPreviousSlide = () => emblaApi.value?.scrollPrev();
const goToNextSlide = () => emblaApi.value?.scrollNext();
</script>

<template>
  <div>
    <div class="embla">
      <div class="embla__viewport" ref="emblaRef">
        <div class="embla__container">
          <div v-for="subscription in subscriptions" :key="subscription.id" class="embla__slide">
            <SubscriptionImage :subscription="subscription" />
          </div>
        </div>
      </div>

      <button class="embla__prev" @click="goToPreviousSlide">
        <Icon name="lucide:chevron-left" class="text-2xl" />
      </button>

      <button class="embla__next" @click="goToNextSlide">
        <Icon name="lucide:chevron-right" class="text-2xl" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.embla {
  --slide-size: var(--subscription-image-size);
  --slide-spacing: 1rem;

  position: relative;
}

.embla__viewport {
  overflow: hidden;
}

.embla__container {
  display: flex;
  touch-action: pan-y pinch-zoom;
  margin-left: calc(var(--slide-spacing) * -1);
}

.embla__slide {
  box-sizing: content-box;
  flex: 0 0 var(--slide-size);
  min-width: 0;
  padding-left: var(--slide-spacing);

  &:last-child {
    margin-right: va(--slide-spacing);
  }
}

.embla:hover {
  .embla__prev,
  .embla__next {
    opacity: 1;
  }
}

.embla__prev,
.embla__next {
  opacity: 0;
  display: flex;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}
.embla__prev {
  left: 0;
}
.embla__next {
  right: 0;
}
</style>
