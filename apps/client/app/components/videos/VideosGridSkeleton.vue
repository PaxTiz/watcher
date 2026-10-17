<template>
  <div class="infinite-grid-[300px] gap-x-4 gap-y-8">
    <VideoCardSkeleton v-for="i in 6" :key="i" :index="i" />
  </div>
</template>
