<script lang="ts" generic="K extends string, T extends string" setup>
import { computed, defineComponent, h, ref, resolveComponent } from "vue";
import type { ComponentProps } from "vue-component-type-helpers";

import type { DropdownItem } from "../types/dropdown";
import Button from "./Button.vue";
import FormInput from "./FormInput.vue";

const emit = defineEmits<{ select: [key: K, value: T] }>();
const props = defineProps<{
  label?: string;
  ariaLabel?: string;
  icon?: string;
  iconSize?: "normal" | "lg";
  color?: "primary" | "secondary" | "yellow" | "ghost";
  size?: "sm" | "normal" | "lg";
  value?: T;
  align?: "start" | "center" | "end";
  items: Array<DropdownItem<K, T>>;
  ui?: {
    button?: ComponentProps<typeof Button>["ui"];
  };
}>();

const isOpen = ref(false);

const on_select_item = (item: DropdownItem<K, T>) => {
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

    return () => {
      const Icon = resolveComponent("Icon");
      const DropdownMenuSubContent = resolveComponent("DropdownMenuSubContent");
      const DropdownMenuItem = resolveComponent("DropdownMenuItem");

      return h(
        DropdownMenuSubContent,
        {
          sideOffset: 6,
          alignOffset: -6,
          class:
            "menu-surface relative z-1000 flex max-h-[280px] min-w-[max(var(--reka-dropdown-menu-trigger-width),11rem)] w-max flex-col overflow-y-auto",
        },
        () => [
          childProps.item.allowSearch &&
            h(
              "div",
              {
                class: "sticky z-1001 -top-1.5 -mx-1.5 -mt-1.5 mb-1 p-1.5 bg-ui-bg",
              },
              h(FormInput, {
                placeholder: "Rechercher une chaîne",
                class: "w-full",
                size: "sm",
                modelValue: searchQuery.value,
                "onUpdate:modelValue": (v) => (searchQuery.value = v),
              }),
            ),
          ...availableChildren.value.map((child) =>
            h(
              DropdownMenuItem,
              {
                key: child.value,
                disabled: child.disabled,
                class: "menu-item" + (childProps.item.value === child.value ? " font-medium" : ""),
                onClick: () =>
                  !child.disabled && childProps.onSelect(childProps.item.key, child.value),
              },
              () => [
                child.icon && h(Icon, { name: child.icon }),
                h("span", { class: "flex-1" }, child.label),
                childProps.item.value === child.value &&
                  h(Icon, { name: "lucide:check", class: "ml-auto shrink-0 !text-alt" }),
              ],
            ),
          ),
        ],
      );
    };
  },
  { props: ["item", "value", "onSelect"] },
);
</script>

<template>
  <div class="relative">
    <DropdownMenuRoot v-model:open="isOpen">
      <DropdownMenuTrigger :aria-label="ariaLabel ?? label" as-child>
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
              class="menu-surface z-1000 flex w-max min-w-[max(var(--reka-dropdown-menu-trigger-width),11rem)] flex-col"
            >
              <template v-for="(item, index) in items" :key="index">
                <DropdownMenuSeparator v-if="item.type === 'divider'" class="menu-separator" />

                <DropdownMenuLabel v-else-if="item.type === 'label'" class="menu-label">
                  {{ item.label }}
                </DropdownMenuLabel>

                <DropdownMenuSub v-else-if="item.children && item.children.length > 0">
                  <DropdownMenuSubTrigger
                    :disabled="item.disabled"
                    :value="item.label"
                    as="button"
                    class="menu-item"
                  >
                    <div class="flex flex-1 items-center gap-2.5">
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
                  :disabled="item.disabled"
                  class="menu-item"
                  :class="{ 'font-medium': value && value === item.value }"
                  @click="() => !item.disabled && on_select_item(item)"
                >
                  <Icon v-if="item.icon" :name="item.icon" />
                  <span class="flex-1">{{ item.label }}</span>
                  <Icon
                    v-if="value && value === item.value"
                    name="lucide:check"
                    class="!text-alt ml-auto shrink-0"
                  />
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
