<template>
  <AppHeader />

  <main class="container flex gap-8 pt-6 pb-24 md:pt-8 md:pb-8">
    <SubscriptionsSidebar class="hidden lg:block" />

    <div class="min-w-0 flex-1 px-2 md:px-0">
      <NuxtPage />
    </div>
  </main>

  <AppBottomNav />
</template>
