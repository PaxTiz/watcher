<template>
  <div class="infinite-grid-[300px] gap-4">
    <VideoCardSkeleton v-for="i in 6" :key="i" :index="i" />
  </div>
</template>
