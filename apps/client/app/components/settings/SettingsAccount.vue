<script lang="ts" setup>
const { user } = useUserSession();
</script>

<template>
  <section class="border-ui-border border-t pt-8">
    <h2 class="text-2xl font-semibold text-white">Profil</h2>
    <Card class="mt-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400">Nom d'affichage</label>
          <p class="mt-1 text-white">{{ user?.name }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400">Identifiant interne</label>
          <p class="mt-1 font-mono text-xs text-gray-500">{{ user?.id }}</p>
        </div>
      </div>
    </Card>
  </section>
</template>
