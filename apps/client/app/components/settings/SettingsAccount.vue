<script lang="ts" setup>
const { user } = useUserSession();
</script>

<template>
  <section class="border-ui-border border-t pt-8">
    <h2 class="text-ui-text text-2xl font-semibold">Profil</h2>
    <Card class="mt-6">
      <div class="space-y-4">
        <div>
          <label class="text-ui-text-muted block text-sm font-medium">Nom d'affichage</label>
          <p class="text-ui-text mt-1">{{ user?.name }}</p>
        </div>
        <div>
          <label class="text-ui-text-muted block text-sm font-medium">Identifiant interne</label>
          <p class="text-ui-text-muted mt-1 font-mono text-xs">{{ user?.id }}</p>
        </div>
      </div>
    </Card>
  </section>
</template>
