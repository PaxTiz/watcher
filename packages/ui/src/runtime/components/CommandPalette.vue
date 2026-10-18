<script setup lang="ts" generic="T = unknown">
import {
  ListboxContent,
  ListboxFilter,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxRoot,
} from "reka-ui";
import { computed, onBeforeUnmount, onMounted } from "vue";

import type { CommandItem } from "../types/command_palette";

const {
  placeholder = "Rechercher",
  title = "Palette de commandes",
  manualFilter = false,
  loading = false,
  emptyText = "Aucun résultat",
  closeOnSelect = true,
  lockScroll = true,
  items,
  ui,
} = defineProps<{
  items: CommandItem<T>[];
  placeholder?: string;
  title?: string;
  manualFilter?: boolean;
  loading?: boolean;
  emptyText?: string;
  closeOnSelect?: boolean;
  lockScroll?: boolean;
  ui?: { content?: string; body?: string };
}>();

const search = defineModel<string>("search", { default: "" });

const emit = defineEmits<{
  select: [item: CommandItem<T>];
  close: [item?: CommandItem<T>];
}>();

defineSlots<{
  icon?: () => any;
  filters?: () => any;
  item?: (props: { item: CommandItem<T> }) => any;
  empty?: (props: { search: string }) => any;
  footer?: () => any;
}>();

const modalUi = computed(() => ({
  content: ["inset-0 items-start! pt-[12vh]! max-sm:pt-4!", ui?.content].filter(Boolean).join(" "),
  body: ["max-h-[76vh] max-w-2xl rounded-2xl! p-0! md:p-0!", ui?.body].filter(Boolean).join(" "),
}));

const kbd =
  "bg-ui-text/[0.06] ring-ui-text/10 text-ui-text-muted inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 font-sans text-[11px] font-medium ring-1 ring-inset";

let previouslyFocused: HTMLElement | null = null;
let previousOverflow = "";

onMounted(() => {
  previouslyFocused = document.activeElement as HTMLElement | null;
  if (lockScroll) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
});

onBeforeUnmount(() => {
  if (lockScroll) document.body.style.overflow = previousOverflow;
  previouslyFocused?.focus?.();
});

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const filtered = computed(() => {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  if (manualFilter || terms.length === 0) return items;

  return items.filter((item) => {
    const haystack = normalize([item.label, ...(item.keywords ?? [])].join(" "));
    return terms.every((term) => haystack.includes(term));
  });
});

const groups = computed(() => {
  const map = new Map<string, CommandItem<T>[]>();
  for (const item of filtered.value) {
    const key = item.group ?? "";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return [...map.entries()].map(([label, items]) => ({ label, items }));
});

function onSelect(item: CommandItem<T>) {
  if (item.disabled) return;
  emit("select", item);
  if (closeOnSelect) emit("close", item);
}
</script>

<template>
  <WatcherModal :ui="modalUi">
    <div role="dialog" aria-modal="true" :aria-label="title" class="flex min-h-0 flex-1 flex-col">
      <ListboxRoot highlight-on-hover class="flex min-h-0 flex-1 flex-col">
        <div class="border-ui-text/10 flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <slot name="icon">
            <Icon
              :name="loading ? 'lucide:loader-circle' : 'lucide:search'"
              class="text-ui-text-muted shrink-0 text-lg"
              :class="{ 'animate-spin': loading }"
              aria-hidden="true"
            />
          </slot>

          <ListboxFilter
            v-model="search"
            auto-focus
            autocomplete="off"
            spellcheck="false"
            :placeholder="placeholder"
            class="text-ui-text h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
          />

          <kbd :class="kbd">Échap</kbd>
        </div>

        <slot name="filters" />

        <ListboxContent class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
          <div
            v-if="groups.length === 0 && !loading"
            class="text-ui-text-muted flex flex-col items-center gap-2 px-6 py-10 text-center text-sm"
          >
            <Icon name="lucide:search-x" class="text-2xl" aria-hidden="true" />
            <slot name="empty" :search="search">{{ emptyText }}</slot>
          </div>

          <ListboxGroup v-for="group in groups" :key="group.label" class="not-first:mt-2">
            <ListboxGroupLabel v-if="group.label" class="menu-label">
              {{ group.label }}
            </ListboxGroupLabel>

            <ListboxItem
              v-for="item in group.items"
              :key="item.id"
              :value="item"
              :disabled="item.disabled"
              class="menu-item gap-3! rounded-xl! p-2! select-none"
              @select.prevent="onSelect(item)"
            >
              <slot name="item" :item="item">
                <span>{{ item.label }}</span>
              </slot>
            </ListboxItem>
          </ListboxGroup>
        </ListboxContent>

        <div
          class="border-ui-text/10 text-ui-text-muted flex shrink-0 items-center gap-4 border-t px-4 py-2.5 text-xs max-sm:hidden"
        >
          <slot name="footer">
            <span class="flex items-center gap-1.5">
              <kbd :class="kbd"><Icon name="lucide:arrow-up" /></kbd>
              <kbd :class="kbd"><Icon name="lucide:arrow-down" /></kbd>
              Naviguer
            </span>
            <span class="flex items-center gap-1.5">
              <kbd :class="kbd"><Icon name="lucide:corner-down-left" /></kbd>
              Sélectionner
            </span>
          </slot>
        </div>
      </ListboxRoot>
    </div>
  </WatcherModal>
</template>
