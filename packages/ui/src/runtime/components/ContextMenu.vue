<script lang="ts" generic="T extends string" setup>
import { type ComponentPublicInstance } from "vue";

export type ContextMenuEntry<V extends string> =
  | { type: "label"; label: string }
  | { type: "separator" }
  | {
      type: "item";
      label: string;
      value: V;
      icon?: string;
      disabled?: boolean;
      destructive?: boolean;
    };

const props = defineProps<{
  items: Array<ContextMenuEntry<T>>;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [value: T];
}>();

defineSlots<{
  default(): any;
}>();

const onSelect = (value: T) => {
  emit("select", value);
};
</script>

<template>
  <ContextMenuRoot>
    <ContextMenuTrigger :disabled="disabled" as-child>
      <slot />
    </ContextMenuTrigger>

    <ContextMenuPortal>
      <Transition appear>
        <ContextMenuContent
          class="menu-surface z-1000 flex w-max min-w-44 flex-col"
          :side-offset="5"
        >
          <template v-for="(entry, index) in items" :key="index">
            <ContextMenuLabel v-if="entry.type === 'label'" class="menu-label">
              {{ entry.label }}
            </ContextMenuLabel>

            <ContextMenuSeparator v-else-if="entry.type === 'separator'" class="menu-separator" />

            <ContextMenuItem
              v-else
              :value="entry.value"
              :disabled="entry.disabled"
              class="menu-item"
              :class="{ '!text-red-500 [&_svg]:!text-red-500': entry.destructive }"
              @select="onSelect(entry.value)"
            >
              <Icon v-if="entry.icon" :name="entry.icon" />
              <span class="flex-1">{{ entry.label }}</span>
            </ContextMenuItem>
          </template>
        </ContextMenuContent>
      </Transition>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
