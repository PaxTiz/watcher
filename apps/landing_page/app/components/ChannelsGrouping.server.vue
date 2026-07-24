<template>
  <section class="bg-background-dark py-16">
    <div class="container">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 class="section-title__white">Une seule entité, plusieurs chaînes</h2>
          <p class="section-description mt-4">
            Beaucoup de créateurs diffusent en direct sur Twitch et publient leurs rediffusions sur
            une chaîne YouTube dédiée. Avec Watcher, tu regroupes ces chaînes en une seule entité :
            plus de doublons, plus de confusion, juste le bon créateur.
          </p>

          <ul class="mt-4 space-y-2 pl-4 text-gray-300">
            <li class="list-disc">Regroupe autant de chaînes que tu veux par créateur</li>
            <li class="list-disc">Un seul flux, une seule notification, un seul profil</li>
            <li class="list-disc">Idéal pour les streamers Twitch avec chaîne replay YouTube</li>
          </ul>
        </div>

        <div class="flex items-center justify-center">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
              flex-wrap: wrap;
            "
          >
            <div style="display: flex; flex-direction: column; gap: 14px">
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  background: rgb(30, 30, 46);
                  border: 1px solid rgb(49, 50, 68);
                  border-radius: 12px;
                  padding: 12px 16px;
                "
              >
                <div
                  style="
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    background: rgb(145, 70, 255);
                    flex-shrink: 0;
                  "
                ></div>
                <div>
                  <p
                    style="
                      margin: 0px;
                      font-size: 13px;
                      font-weight: 800;
                      color: rgb(205, 214, 244);
                    "
                  >
                    Squeezie
                  </p>
                  <p style="margin: 0px; font-size: 11px; color: rgb(148, 163, 184)">
                    Twitch · live
                  </p>
                </div>
              </div>
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  background: rgb(30, 30, 46);
                  border: 1px solid rgb(49, 50, 68);
                  border-radius: 12px;
                  padding: 12px 16px;
                "
              >
                <div
                  style="
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    background: rgb(255, 0, 0);
                    flex-shrink: 0;
                  "
                ></div>
                <div>
                  <p
                    style="
                      margin: 0px;
                      font-size: 13px;
                      font-weight: 800;
                      color: rgb(205, 214, 244);
                    "
                  >
                    Squeezie - Rediffusions
                  </p>
                  <p style="margin: 0px; font-size: 11px; color: rgb(148, 163, 184)">
                    YouTube · <span class="sc-interp">rediffusions</span>
                  </p>
                </div>
              </div>
            </div>
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                color: rgb(255, 140, 66);
              "
            >
              <span style="font-size: 22px; font-weight: 900">→</span>
              <span
                style="
                  font-size: 10px;
                  font-weight: 800;
                  color: rgb(148, 163, 184);
                  letter-spacing: 0.03em;
                "
                ><span class="sc-interp">FUSION</span></span
              >
            </div>
            <div
              style="
                display: flex;
                align-items: center;
                gap: 10px;
                background: linear-gradient(
                  rgba(254, 100, 11, 0.15) 0%,
                  rgba(254, 100, 11, 0.05) 100%
                );
                border: 1px solid rgb(254, 100, 11);
                border-radius: 12px;
                padding: 14px 18px;
              "
            >
              <div style="position: relative; width: 38px; height: 38px; flex-shrink: 0">
                <div
                  style="
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    width: 26px;
                    height: 26px;
                    border-radius: 8px;
                    background: rgb(145, 70, 255);
                    border: 2px solid rgb(17, 17, 27);
                  "
                ></div>
                <div
                  style="
                    position: absolute;
                    bottom: 0px;
                    right: 0px;
                    width: 26px;
                    height: 26px;
                    border-radius: 8px;
                    background: rgb(255, 0, 0);
                    border: 2px solid rgb(17, 17, 27);
                  "
                ></div>
              </div>
              <div>
                <p
                  style="margin: 0px; font-size: 13px; font-weight: 800; color: rgb(205, 214, 244)"
                >
                  Squeezie
                </p>
                <p style="margin: 0px; font-size: 11px; color: rgb(255, 140, 66); font-weight: 700">
                  <span class="sc-interp">1 entité · 2 chaînes</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
