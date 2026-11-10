<script lang="ts" setup>
import {
  player_shortcuts,
  shortcuts,
  type ShortcutGroup,
  type ShortcutName,
} from "~/utils/shortcuts";

const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
const { label } = useShortcutHints();

const groups = computed(() =>
  (["general", "navigation", "video"] as Array<ShortcutGroup>).map((group) => ({
    group,
    items: [
      ...(Object.keys(shortcuts) as Array<ShortcutName>)
        .filter((name) => shortcuts[name].group === group)
        .map((name) => ({ id: name, label: t(`shortcuts.actions.${name}`), keys: [label(name)] })),
      ...(group === "video"
        ? player_shortcuts.map((item) => ({
            id: item.keys.join(),
            label: t(`shortcuts.player.${item.action}`),
            keys: item.keys.map((key) => (key === "Space" ? t("shortcuts.space") : key)),
          }))
        : []),
    ],
  })),
);
</script>

<template>
  <WatcherModal :ui="{ body: 'w-full max-w-[480px] max-h-[85vh]' }">
    <div role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" class="min-h-0">
      <div class="flex items-center justify-between gap-4">
        <h2 id="shortcuts-title" class="text-ui-text text-lg font-semibold">
          {{ t("shortcuts.title") }}
        </h2>
        <button
          type="button"
          class="text-ui-text-muted hover:bg-ui-text/10 hover:text-ui-text flex size-8 items-center justify-center rounded-lg transition-colors"
          :aria-label="t('shortcuts.close')"
          @click="emit('close')"
        >
          <Icon name="lucide:x" class="text-lg" />
        </button>
      </div>

      <div class="mt-4 max-h-[calc(85vh-8rem)] space-y-5 overflow-y-auto">
        <section v-for="{ group, items } in groups" :key="group">
          <h3 class="text-ui-text-muted mb-1.5 text-xs font-semibold tracking-wider uppercase">
            {{ t(`shortcuts.groups.${group}`) }}
          </h3>
          <ul class="divide-ui-text/[0.06] divide-y">
            <li
              v-for="item in items"
              :key="item.id"
              class="flex items-center justify-between gap-4 py-2 text-sm"
            >
              <span class="text-ui-text">{{ item.label }}</span>
              <span class="flex shrink-0 items-center gap-1">
                <WatcherKbd v-for="key in item.keys" :key="key">{{ key }}</WatcherKbd>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </WatcherModal>
</template>
