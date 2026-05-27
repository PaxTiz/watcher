<script lang="ts" setup>
const route = useRoute();

const navItems = [
  { label: "Accueil", to: "/", icon: "lucide:home" },
  { label: "Abonnements", to: "/subscriptions", icon: "lucide:layout-grid" },
  { label: "Vidéos", to: "/videos", icon: "lucide:play-square" },
];

const isActive = (path: string) => {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};
</script>

<template>
  <nav
    class="bg-ui-bg/80 border-ui-border pb-safe fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t py-3 backdrop-blur-xl lg:hidden"
  >
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center gap-1 px-4 transition-all"
      :class="isActive(item.to) ? 'text-alt' : 'text-ui-text-muted'"
    >
      <Icon :name="item.icon" class="text-2xl" />
      <span class="text-[10px] font-bold tracking-widest uppercase">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
}
</style>
