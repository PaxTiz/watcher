<script lang="ts" setup>
const modelValue = defineModel<string>({ required: true });

const name = inject<string | undefined>("name");
</script>

<template>
  <input v-model="modelValue" :name="name" :id="name" />
</template>
