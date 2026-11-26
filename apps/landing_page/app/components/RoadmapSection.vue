<script lang="ts" setup>
type Status = "idea" | "dev" | "done";

const { t } = useI18n();

const ROADMAP: Array<{ key: string; status: Status }> = [
  { key: "fusion", status: "dev" },
  { key: "mobile", status: "idea" },
  { key: "platforms", status: "idea" },
  { key: "favorites", status: "done" },
  { key: "player", status: "done" },
  { key: "autoplay", status: "done" },
  { key: "hide", status: "done" },
  { key: "search", status: "done" },
];

const COLUMNS: Array<Status> = ["idea", "dev", "done"];

const columns = COLUMNS.map((status) => ({
  status,
  items: ROADMAP.filter((item) => item.status === status),
}));

const selected = ref<(typeof ROADMAP)[number] | null>(null);
const panel = useTemplateRef("panel");

onKeyStroke("Escape", () => {
  selected.value = null;
});

watch(selected, async (value) => {
  if (value) {
    await nextTick();
    panel.value?.focus();
  }
});
</script>

<template>
  <section id="roadmap" aria-labelledby="roadmap-title" class="flex flex-col gap-11">
    <SectionHeading
      id="roadmap-title"
      number="05"
      :label="t('roadmap.label')"
      :title="t('roadmap.title')"
    >
      <p class="text-ui-text-muted m-0 max-w-[520px] text-[17px] leading-[1.6] text-pretty">
        {{ t("roadmap.lead") }}
      </p>
    </SectionHeading>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] items-start gap-4">
      <div
        v-for="column in columns"
        :key="column.status"
        class="bg-ui-bg flex min-w-0 flex-col rounded-3xl border p-2"
        :class="column.status === 'dev' ? 'border-ui-text/45' : 'border-ui-border'"
      >
        <div class="flex items-center gap-2.5 px-3 py-3.5">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle
              v-if="column.status === 'idea'"
              cx="8"
              cy="8"
              r="6.25"
              fill="none"
              stroke-width="1.5"
              stroke-dasharray="2.3 2.3"
              class="stroke-[color-mix(in_oklab,var(--color-highlight)_100%,black_40%)]"
            />
            <template v-else-if="column.status === 'dev'">
              <circle cx="8" cy="8" r="6.25" fill="none" stroke="#fe640b" stroke-width="1.5" />
              <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="#fe640b" />
            </template>
            <template v-else>
              <circle cx="8" cy="8" r="6.25" class="fill-ui-text" />
              <path
                d="M5 8.2l2 2 4-4.4"
                fill="none"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="stroke-background"
              />
            </template>
          </svg>
          <h3 class="text-ui-text m-0 text-[15px] font-semibold">
            {{ t(`roadmap.columns.${column.status}`) }}
          </h3>
          <span
            class="text-ui-text-muted bg-ui-text/[0.07] ml-auto box-border inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums"
          >
            {{ column.items.length }}
          </span>
        </div>
        <ul class="m-0 flex list-none flex-col p-0">
          <li v-for="item in column.items" :key="item.key">
            <button
              type="button"
              aria-haspopup="dialog"
              class="hover:bg-ui-text/5 flex w-full cursor-pointer items-center gap-4 rounded-2xl border-none bg-transparent px-3 py-3.5 text-left"
              @click="selected = item"
            >
              <span class="flex min-w-0 flex-1 flex-col gap-1">
                <span class="text-ui-text text-base font-semibold">
                  {{ t(`roadmap.items.${item.key}.title`) }}
                </span>
                <span class="text-ui-text-muted text-sm leading-normal text-pretty">
                  {{ t(`roadmap.items.${item.key}.description`) }}
                </span>
              </span>
              <span aria-hidden="true" class="text-ui-text-muted text-xl leading-none">›</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200"
        leave-active-class="transition duration-200"
        enter-from-class="opacity-0 [&>aside]:translate-x-6"
        leave-to-class="opacity-0 [&>aside]:translate-x-6"
      >
        <div v-if="selected" class="fixed inset-0 z-100">
          <button
            type="button"
            :aria-label="t('roadmap.close')"
            class="absolute inset-0 size-full cursor-default border-none bg-[rgba(18,21,33,0.45)] p-0"
            @click="selected = null"
          />
          <aside
            ref="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="roadmap-panel-title"
            tabindex="-1"
            class="bg-ui-bg text-ui-text border-ui-border absolute top-2 right-2 bottom-2 box-border flex w-[min(440px,calc(100%-16px))] flex-col overflow-hidden rounded-3xl border shadow-[0_24px_60px_-12px_rgba(18,21,33,0.5)] transition-transform duration-200 focus:outline-none"
          >
            <div class="flex items-center justify-between gap-3 pt-5 pr-5 pl-7">
              <span class="text-ui-text-muted text-[13px] font-semibold">
                {{ t(`roadmap.status.${selected.status}`) }}
              </span>
              <button
                type="button"
                :aria-label="t('roadmap.close')"
                class="border-ui-border text-ui-text size-9 cursor-pointer rounded-full border bg-transparent text-lg leading-none"
                @click="selected = null"
              >
                ✕
              </button>
            </div>
            <div class="flex flex-1 flex-col gap-5 overflow-y-auto px-7 pt-5 pb-7">
              <h3
                id="roadmap-panel-title"
                class="font-display m-0 text-[26px] leading-[1.15] font-medium tracking-[-0.02em] text-balance"
              >
                {{ t(`roadmap.items.${selected.key}.title`) }}
              </h3>
              <p class="text-ui-text-muted m-0 text-base leading-[1.6] text-pretty">
                {{ t(`roadmap.items.${selected.key}.description`) }}
              </p>
              <div class="border-ui-border flex flex-col gap-2 border-t pt-5">
                <span
                  class="text-ui-text-muted text-[13px] font-semibold tracking-[0.04em] uppercase"
                >
                  {{ t("roadmap.detail") }}
                </span>
                <p class="text-ui-text m-0 text-[15px] leading-[1.65] text-pretty">
                  {{ t(`roadmap.items.${selected.key}.detail`) }}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
