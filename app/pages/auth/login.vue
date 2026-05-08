<script lang="ts" setup>
definePageMeta({ layout: "auth" });

const { loggedIn } = useUserSession();
if (loggedIn.value) {
  await navigateTo("/");
}
</script>

<template>
  <LoginForm class="mt-32" />
</template>
