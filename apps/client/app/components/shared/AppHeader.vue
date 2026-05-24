<script lang="ts" setup>
import { NuxtLink } from "#components";

const route = useRoute();

const Link = defineComponent<{ label: string; to: string; isActive: boolean }>(
  (props) => {
    return () =>
      h(
        NuxtLink,
        {
          to: props.to,
          "aria-active": props.isActive,
          class:
            "px-4 py-2 rounded-lg transition-all duration-300 text-sm flex items-center gap-2 " +
            "aria-active:bg-alt/10 aria-active:text-alt " +
            "not-aria-active:text-ui-text-muted not-aria-active:hover:text-ui-text not-aria-active:hover:bg-ui-border/40 rounded",
        },
        () => props.label,
      );
  },
  { props: ["label", "to", "isActive"] },
);
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-[var(--navbar-border)] bg-[var(--navbar-bg)] backdrop-blur-xl transition-all duration-300"
  >
    <div class="container py-5">
      <div class="flex items-center">
        <Logo class="mr-12" />

        <nav class="hidden items-center gap-4 md:flex">
          <Link label="Accueil" to="/" :is-active="route.path === '/'" />
          <Link
            label="Abonnements"
            to="/subscriptions"
            :is-active="route.path.startsWith('/subscriptions')"
          />
          <Link label="Vidéos" to="/videos" :is-active="route.path.startsWith('/videos')" />
        </nav>

        <div class="ml-auto flex items-center gap-6">
          <UserDropdown />
        </div>
      </div>
    </div>
  </header>
</template>
