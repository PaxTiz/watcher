<template>
  <AppHeader />

  <main class="container flex gap-8 py-8">
    <SubscriptionsSidebar class="hidden lg:block" />

    <div class="min-w-0 flex-1">
      <NuxtPage />
    </div>
  </main>
</template>
