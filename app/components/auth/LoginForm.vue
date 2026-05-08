<script lang="ts" setup>
import type { FormSubmitEvent } from "#shared/types/forms";
import { type OAuthValidators, oauthValidatorsSchema } from "#shared/validators/oauth";

const state = ref<OAuthValidators["loginWithBluesky"]["body"]>({
  handle: "",
});

const onSubmit = (event: FormSubmitEvent<typeof oauthValidatorsSchema.loginWithBluesky.body>) => {
  window.open(`/api/oauth/bluesky/login?handle=${event.data.handle}`, "_self");
};
</script>

<template>
  <section>
    <Logo />

    <h1 class="mt-4 text-4xl font-bold text-white">Connexion avec BlueSky</h1>
    <p class="mt-1 text-gray-300">
      Veuillez vous connecter avec votre compte BlueSky afin d'accéder à Watcher.
    </p>

    <Card class="mt-4">
      <AppForm
        method="POST"
        :state="state"
        :schema="oauthValidatorsSchema.loginWithBluesky.body"
        @submit="onSubmit"
      >
        <AppFormField label="Handle BlueSky" name="handle">
          <AppFormInput v-model="state.handle" class="w-full" />
        </AppFormField>

        <Button label="Me connecter" type="submit" class="mt-4" />
      </AppForm>
    </Card>
  </section>
</template>
