<script lang="ts" generic="T extends string" setup>
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

import Button from "~/components/shared/Button.vue";

defineProps<{
  label?: string;
  icon?: string;
  items: Array<{
    label: string;
    children: Array<{
      label: string;
      value: T;
      disabled?: boolean;
      icon?: string;
    }>;
  }>;
}>();
</script>

<template>
  <div class="relative">
    <Menu v-slot="{ open }">
      <MenuButton ref="element" as="template">
        <Button :label="label" :icon="icon" />
      </MenuButton>

      <Transition appear>
        <MenuItems
          class="bg-ui-bg border-ui-border absolute z-1000 mt-2 flex w-full flex-col gap-1 rounded border p-1 shadow shadow-black"
        >
          <MenuItem
            v-for="item in items"
            :key="item.label"
            :disabled="item.children.length === 0"
            class="relative aria-disabled:opacity-50"
          >
            <Menu as="div" horizontal>
              <MenuButton
                class="text-ui-text hover:bg-ui-border flex w-full items-center justify-between gap-2 rounded p-1 text-start text-sm"
                as="button"
              >
                <span>{{ item.label }}</span>

                <Icon name="lucide:chevron-right" />
              </MenuButton>

              <Transition appear>
                <MenuItems
                  class="bg-ui-bg border-ui-border absolute -top-1 left-[calc(100%+0.5rem)] z-1000 flex flex-col gap-1 rounded border p-1 shadow shadow-black"
                >
                  <MenuItem
                    v-for="child in item.children"
                    :key="child.value"
                    as="button"
                    class="text-ui-text hover:bg-ui-border flex w-full min-w-[100px] items-center justify-between gap-2 rounded p-1 text-start text-sm"
                  >
                    {{ child.label }}
                  </MenuItem>
                </MenuItems>
              </Transition>
            </Menu>
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
