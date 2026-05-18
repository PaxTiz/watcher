<script lang="ts" generic="T extends string" setup>
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";

import { CLEAN_ERROR_SYMBOL, HAS_FORM_SINGLE_ERROR_SYMBOL } from "#shared/types/forms";

const modelValue = defineModel<string>();
const props = defineProps<{
  placeholder?: string;
  items: Array<{
    label: string;
    value: T;
    disabled?: boolean;
  }>;
}>();

const selectedValue = computed(() => {
  const value = props.items.find((e) => e.value === modelValue.value);
  return value?.label || modelValue.value || props.placeholder || "Aucun élément sélectionné";
});

const __internal_element__ = useTemplateRef<HTMLButtonElement | undefined>("element");

const name = inject<string | undefined>("name", undefined);
const hasError = inject<ComputedRef<boolean>>(
  HAS_FORM_SINGLE_ERROR_SYMBOL,
  computed(() => false),
);
const onCleanError = inject<(key: string) => void>(CLEAN_ERROR_SYMBOL, () => {});

const onSelectValue = (value?: T) => {
  if (name) {
    onCleanError?.(name);
  }

  modelValue.value = value;
};

defineExpose({
  focus: () => {
    __internal_element__.value?.focus();
  },
});
</script>

<template>
  <div class="relative">
    <Listbox v-model="modelValue" v-slot="{ open }">
      <ListboxButton
        ref="element"
        as="button"
        class="bg-ui-bg border-ui-border text-ui-text cursor-p flex min-h-[38px] w-full items-center justify-between gap-2 rounded border px-2 py-1"
        :class="{ 'ring ring-red-400': hasError }"
      >
        <span>{{ selectedValue }}</span>
        <Icon
          name="lucide:chevron-down"
          class="transition-all duration-300"
          :class="{ 'rotate-180': open }"
        />
      </ListboxButton>

      <Transition appear>
        <ListboxOptions
          class="bg-ui-bg border-ui-border absolute z-1000 mt-2 flex w-full flex-col gap-1 rounded border p-1 shadow shadow-black"
        >
          <ListboxOption
            v-for="item in [
              { label: placeholder ?? '-', value: undefined, disabled: false },
              ...items,
            ]"
            :key="item.value"
            :value="item.value"
            :disabled="item.disabled"
            class="text-ui-text hover:bg-ui-border flex items-center justify-start gap-2 rounded p-1 text-start text-sm"
            @click="onSelectValue(item.value)"
          >
            <span v-if="item.value === modelValue" class="w-[15px]">
              <Icon name="lucide:check" />
            </span>
            <span v-else class="w-[15px]"></span>

            <span>{{ item.label }}</span>
          </ListboxOption>
        </ListboxOptions>
      </Transition>
    </Listbox>
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
