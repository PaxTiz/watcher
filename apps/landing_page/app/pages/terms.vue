<script lang="ts" setup>
const content = useLegalContent();
</script>

<template>
  <LegalPage :document="content.terms" />
</template>
