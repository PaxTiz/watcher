<template>
  <div
    class="bg-frame flex min-h-screen flex-col [--sheet-side:8px] min-[820px]:[--sheet-side:12px]"
  >
    <slot name="header" />

    <div
      aria-hidden="true"
      class="pointer-events-none fixed inset-x-0 top-16 z-49 h-6 overflow-hidden"
    >
      <div
        class="absolute inset-x-[var(--sheet-side)] top-0 -bottom-10 rounded-3xl shadow-[0_0_0_40px_var(--frame)]"
      />
    </div>
    <div
      aria-hidden="true"
      class="pointer-events-none fixed inset-x-0 bottom-0 z-49 h-[calc(var(--sheet-side)+24px)] overflow-hidden"
    >
      <div
        class="absolute inset-x-[var(--sheet-side)] -top-10 bottom-[var(--sheet-side)] rounded-3xl shadow-[0_0_0_40px_var(--frame)]"
      />
    </div>

    <main
      id="main-content"
      class="bg-background relative mx-[var(--sheet-side)] mb-[var(--sheet-side)] min-w-0 flex-1 rounded-3xl"
    >
      <div
        class="mx-auto flex w-full max-w-[1280px] flex-col gap-36 px-[clamp(16px,3vw,40px)] pt-[clamp(16px,3vw,40px)] pb-10"
      >
        <slot />
      </div>
    </main>
  </div>
</template>
