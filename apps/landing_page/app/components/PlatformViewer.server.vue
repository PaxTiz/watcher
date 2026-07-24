<template>
  <section class="container py-16">
    <h2 class="text-center text-4xl font-black">Ta liste de créateurs, enfin lisible</h2>
    <p class="text-landing-text mt-4 text-center text-lg">
      Un panneau latéral avec toutes tes chaînes, un badge pour les lives en cours, et un aperçu
      vidéo au survol. Tu ne rates plus jamais une sortie.
    </p>

    <div
      class="mt-8"
      data-dc-tpl="294"
      style="
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 16px;
        background: repeating-linear-gradient(
          135deg,
          rgb(248, 250, 252) 0px,
          rgb(248, 250, 252) 14px,
          rgb(255, 255, 255) 14px,
          rgb(255, 255, 255) 28px
        );
        border: 1px solid rgb(226, 232, 240);
        box-shadow: rgba(0, 0, 0, 0.2) 0px 24px 48px -18px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 32px;
      "
    >
      <span
        data-dc-tpl="295"
        style="
          font-family: monospace;
          font-size: 13px;
          color: rgb(100, 116, 139);
          background: rgb(255, 255, 255);
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid rgb(226, 232, 240);
        "
        ><span class="sc-interp">capture d'écran — panneau créateurs</span></span
      >
    </div>

    <div class="mt-8 flex items-center justify-center gap-8">
      <div class="inline-flex items-center gap-2">
        <div class="bg-alt h-2 w-2 rounded"></div>
        <span class="text-landing-text text-sm font-bold"> Badge « en direct » en temps réel </span>
      </div>

      <div class="inline-flex items-center gap-2">
        <div class="bg-alt h-2 w-2 rounded"></div>
        <span class="text-landing-text text-sm font-bold">
          Filtres par plateforme ou créateur
        </span>
      </div>

      <div class="inline-flex items-center gap-2">
        <div class="bg-alt h-2 w-2 rounded"></div>
        <span class="text-landing-text text-sm font-bold"> Synchronisation automatique </span>
      </div>
    </div>
  </section>
</template>
