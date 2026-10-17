<template>
  <!-- Always dark: the sign-in and onboarding sit on the app's frame -->
  <div
    class="dark text-ui-text grid min-h-dvh bg-[var(--frame)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:p-2"
  >
    <div
      class="relative isolate flex items-center justify-center overflow-hidden px-5 py-12 lg:px-12"
    >
      <div
        class="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
        aria-hidden="true"
        style="
          background-image:
            radial-gradient(50% 45% at 10% 0%, rgb(255 0 51 / 0.16), transparent 100%),
            radial-gradient(50% 45% at 70% 0%, rgb(145 70 255 / 0.18), transparent 100%),
            radial-gradient(40% 35% at 40% 5%, rgb(254 100 11 / 0.12), transparent 100%);
        "
      />

      <main class="w-full max-w-md">
        <NuxtPage />
      </main>
    </div>

    <AuthPreview class="hidden rounded-2xl shadow-[0_0_0_1px_rgb(255_255_255/0.06)] lg:block" />
  </div>
</template>
