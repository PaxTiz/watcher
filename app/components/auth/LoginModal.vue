<script lang="ts" setup>
const modelValue = defineModel<boolean>({ required: true });

const modal = useTemplateRef("modal");

const closeModal = () => {
  modelValue.value = false;
};

onClickOutside(modal, closeModal);
onKeyStroke("Escape", closeModal);
</script>

<template>
  <div>
    <div
      class="bg-ui-bg fixed top-0 left-0 h-full w-full transition-all duration-200"
      :class="{ 'z-101 opacity-100': modelValue, '-z-1 opacity-0': !modelValue }"
    >
      <!-- Backdrop  -->
    </div>

    <div
      class="fixed bottom-0 left-0 z-102 h-[90%] w-full transition-all duration-400"
      :class="{
        'transform-none': modelValue,
        'translate-y-full': !modelValue,
      }"
    >
      <div
        ref="modal"
        class="bg-background relative mx-8 flex h-full flex-col justify-between rounded-t p-8 shadow shadow-black"
      >
        <LoginForm />

        <Button label="Annuler" class="w-full" @click="closeModal" />
      </div>
    </div>
  </div>
</template>
