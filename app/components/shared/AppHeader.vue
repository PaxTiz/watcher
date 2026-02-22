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
            "border-b border-transparent aria-active:text-alt aria-active:border-alt not-aria-active:text-ui-text hover:text-alt",
        },
        () => props.label,
      );
  },
  { props: ["label", "to", "isActive"] },
);
</script>

<template>
  <header class="bg-slate-900 border-b-3 border-ui-border py-4">
    <div class="container">
      <div class="flex items-center gap-8">
        <Link label="Accueil" to="/" :is-active="route.path === '/'" />
        <Link
          label="Abonnements"
          to="/subscriptions"
          :is-active="route.path.startsWith('/subscriptions')"
        />
        <Link label="Vidéos" to="/videos" :is-active="route.path.startsWith('/videos')" />

        <Link
          label="Paramètres"
          to="/settings"
          :is-active="route.path.startsWith('/settings')"
          class="ml-auto"
        />
        <Button label="Synchroniser" />
      </div>
    </div>
  </header>
</template>
