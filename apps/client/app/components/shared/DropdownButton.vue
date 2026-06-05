<script lang="ts" generic="K extends string, T extends string" setup>
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "reka-ui";
import type { ComponentProps } from "vue-component-type-helpers";

import { AppFormInput, Button, Icon } from "#components";

type DropdownItem = {
  key: K;
  label: string;
  type?: "item" | "label" | "divider";
  value?: T;
  icon?: string;
  allowSearch?: boolean;
  on_select?: () => Promise<unknown>;
  children?: Array<{
    label: string;
    value: T;
    disabled?: boolean;
    icon?: string;
  }>;
};

const emit = defineEmits<{ select: [key: K, value: T] }>();
const props = defineProps<{
  label?: string;
  icon?: string;
  iconSize?: "normal" | "lg";
  color?: "primary" | "secondary" | "yellow" | "ghost";
  size?: "sm" | "normal" | "lg";
  value?: T;
  align?: "start" | "center" | "end";
  items: Array<DropdownItem>;
  ui?: {
    button?: ComponentProps<typeof Button>["ui"];
  };
}>();

const isOpen = ref(false);

const on_select_item = (item: DropdownItem) => {
  emit("select", item.key, item.value as T);

  item.on_select?.();
};

const DropdownChild = defineComponent(
  (childProps: {
    item: (typeof props)["items"][number];
    value?: string;
    onSelect: (key: any, value: any) => void;
  }) => {
    const searchQuery = ref<string | undefined>();
    const availableChildren = computed(() => {
      let items = childProps.item.children ?? [];
      if (childProps.item.allowSearch && searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        items = items.filter((e) => e.label.toLowerCase().includes(query));
      }

      return items;
    });

    return () =>
      h(
        DropdownMenuSubContent,
        {
          sideOffset: 8,
          alignOffset: -4,
          class:
            "bg-ui-bg border-ui-border relative z-1000 flex max-h-[200px] min-w-[var(--reka-dropdown-menu-trigger-width)] w-max flex-col overflow-y-scroll rounded border p-1 shadow shadow-ui-border dark:shadow-black",
        },
        () => [
          childProps.item.allowSearch &&
            h(
              "div",
              {
                class: "fixed z-1001 top-0 left-0 p-1 w-full bg-ui-bg rounded-t",
              },
              h(AppFormInput, {
                placeholder: "Rechercher une chaîne",
                class: "!bg-ui-border w-full",
                size: "sm",
                modelValue: searchQuery.value,
                "onUpdate:modelValue": (v) => (searchQuery.value = v),
              }),
            ),
          childProps.item.allowSearch && h("div", { class: "w-full mt-8" }),
          ...availableChildren.value.map((child) =>
            h(
              DropdownMenuItem,
              {
                key: child.value,
                class:
                  "hover:bg-ui-border/75 data-[highlighted]:bg-ui-border/75 flex w-full min-w-[100px] items-center gap-2 rounded p-1.5 text-start text-sm outline-none cursor-pointer transition-colors " +
                  (props.value === child.value
                    ? "bg-alt/10 text-alt"
                    : "text-ui-text-muted hover:text-ui-text"),
                onClick: () => childProps.onSelect(childProps.item.key, child.value),
              },
              () => [child.icon && h(Icon, { name: child.icon }), h("span", child.label)],
            ),
          ),
        ],
      );
  },
  { props: ["item", "value", "onSelect"] },
);
</script>

<template>
  <div class="relative">
    <DropdownMenuRoot v-model:open="isOpen">
      <DropdownMenuTrigger :aria-label="label" as-child>
        <Button
          :label="label"
          :icon="icon"
          :color="color"
          :size="size"
          :icon-size="iconSize"
          :ui="ui?.button"
          @click.prevent
        />
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <ClientOnly>
          <Transition appear>
            <DropdownMenuContent
              :align="align ?? 'start'"
              :side-offset="5"
              class="bg-ui-bg border-ui-border shadow-ui-border z-1000 flex w-max min-w-[var(--reka-dropdown-menu-trigger-width)] flex-col rounded border p-1 shadow dark:shadow-black"
            >
              <template v-for="(item, index) in items" :key="index">
                <DropdownMenuSeparator
                  v-if="item.type === 'divider'"
                  class="bg-ui-border my-1 h-px"
                />

                <DropdownMenuLabel
                  v-else-if="item.type === 'label'"
                  class="text-ui-text-muted/75 px-2 pt-2 pb-1 text-[10px] font-bold tracking-widest uppercase"
                >
                  {{ item.label }}
                </DropdownMenuLabel>

                <DropdownMenuSub v-else-if="item.children && item.children.length > 0">
                  <DropdownMenuSubTrigger
                    :value="item.label"
                    as="button"
                    class="text-ui-text-muted hover:hover:text-ui-text hover:bg-ui-border/75 data-[state=open]:bg-ui-border/75 flex w-full cursor-pointer items-center justify-between gap-2 rounded p-1.5 text-start text-sm outline-none"
                  >
                    <div class="flex items-center gap-2">
                      <Icon v-if="item.icon" :name="item.icon" />
                      <span>{{ item.label }}</span>
                    </div>

                    <Icon name="lucide:chevron-right" />
                  </DropdownMenuSubTrigger>

                  <DropdownMenuPortal>
                    <DropdownChild
                      :item="item"
                      :value="value"
                      :on-select="(k, v) => emit('select', k, v)"
                    />
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem
                  v-else
                  class="hover:bg-ui-border/75 data-[highlighted]:bg-ui-border/75 flex w-full cursor-pointer items-center gap-2 rounded p-1.5 text-start text-sm transition-colors outline-none"
                  :class="
                    value && value === item.value
                      ? 'bg-alt/10 text-alt'
                      : 'text-ui-text-muted hover:text-ui-text'
                  "
                  @click="() => on_select_item(item)"
                >
                  <Icon v-if="item.icon" :name="item.icon" />
                  <span>{{ item.label }}</span>
                </DropdownMenuItem>
              </template>
            </DropdownMenuContent>
          </Transition>
        </ClientOnly>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
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
