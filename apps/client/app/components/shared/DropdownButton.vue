<script lang="ts" generic="K extends string, T extends string" setup>
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "reka-ui";

import { AppFormInput, Button, Icon } from "#components";

const emit = defineEmits<{ select: [key: K, value: T] }>();
const props = defineProps<{
  label?: string;
  icon?: string;
  color?: "primary" | "secondary" | "yellow" | "ghost";
  size?: "sm" | "normal" | "lg";
  value?: T;
  align?: "start" | "center" | "end";
  items: Array<{
    key: K;
    label: string;
    value?: T;
    icon?: string;
    allowSearch?: boolean;
    children?: Array<{
      label: string;
      value: T;
      disabled?: boolean;
      icon?: string;
    }>;
  }>;
}>();

const isOpen = ref(false);

const DropdownChild = defineComponent<{ item: (typeof props)["items"][number] }>(
  (props) => {
    const searchQuery = ref("");
    const availableChildren = computed(() => {
      let items = props.item.children ?? [];
      if (props.item.allowSearch) {
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
          props.item.allowSearch &&
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
          props.item.allowSearch && h("div", { class: "w-full mt-8" }),
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
                onClick: () => emit("select", props.item.key, child.value),
              },
              () => [child.icon && h(Icon, { name: child.icon }), h("span", child.label)],
            ),
          ),
        ],
      );
  },
  { props: ["item"] },
);
</script>

<template>
  <div class="relative">
    <DropdownMenuRoot v-model:open="isOpen">
      <DropdownMenuTrigger :aria-label="label">
        <Button :label="label" :icon="icon" :color="color" :size="size" />
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <Transition appear>
          <DropdownMenuContent
            :align="align ?? 'start'"
            :side-offset="5"
            class="bg-ui-bg border-ui-border shadow-ui-border z-1000 flex w-max min-w-[var(--reka-dropdown-menu-trigger-width)] flex-col rounded border p-1 shadow dark:shadow-black"
          >
            <template v-for="item in items" :key="item.label">
              <DropdownMenuSub v-if="item.children && item.children.length > 0">
                <DropdownMenuSubTrigger
                  :value="item.label"
                  as="button"
                  class="text-ui-text hover:bg-ui-border/75 data-[state=open]:bg-ui-border/75 flex w-full cursor-pointer items-center justify-between gap-2 rounded p-1.5 text-start text-sm outline-none"
                >
                  <div class="flex items-center gap-2">
                    <Icon v-if="item.icon" :name="item.icon" />
                    <span>{{ item.label }}</span>
                  </div>

                  <Icon name="lucide:chevron-right" />
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownChild :item="item" />
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem
                v-else
                class="hover:bg-ui-border/75 data-[highlighted]:bg-ui-border/75 flex w-full cursor-pointer items-center gap-2 rounded p-1.5 text-start text-sm transition-colors outline-none"
                :class="
                  value === item.value
                    ? 'bg-alt/10 text-alt'
                    : 'text-ui-text-muted hover:text-ui-text'
                "
                @click="emit('select', item.key, item.value as T)"
              >
                <Icon v-if="item.icon" :name="item.icon" />
                <span>{{ item.label }}</span>
              </DropdownMenuItem>
            </template>
          </DropdownMenuContent>
        </Transition>
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
