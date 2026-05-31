<script lang="ts" setup>
import type { FormSubmitEvent } from "#shared/types/forms";
import { type OAuthValidators, oauthValidatorsSchema } from "#shared/validators/oauth";

const {
  title = "Connexion avec BlueSky",
  description = "Veuillez vous connecter avec votre compte BlueSky afin d'accéder à Watcher.",
  button = "Me connecter",
  link = false,
} = defineProps<{
  title?: string;
  description?: string;
  button?: string;
  link?: boolean;
}>();

const input = useTemplateRef("input");
const state = ref<OAuthValidators["loginWithBluesky"]["body"]>({
  handle: "",
});

const onSubmit = (event: FormSubmitEvent<typeof oauthValidatorsSchema.loginWithBluesky.body>) => {
  let url = `/api/oauth/bluesky?handle=${event.data.handle}`;
  if (link) {
    url += "&integration=true";
  }

  window.open(url, "_self");
};

onMounted(() => {
  input.value?.focus();
});
</script>

<template>
  <section>
    <Logo />

    <h1 class="text-ui-text mt-4 text-2xl font-bold md:text-4xl">{{ title }}</h1>
    <p class="text-ui-text-muted mt-1">
      {{ description }}
    </p>

    <Card class="mt-4">
      <AppForm
        method="POST"
        :state="state"
        :schema="oauthValidatorsSchema.loginWithBluesky.body"
        @submit="onSubmit"
      >
        <AppFormField label="Identifiant BlueSky" name="handle">
          <AppFormInput ref="input" v-model="state.handle" class="w-full" />
        </AppFormField>

        <Button :label="button" type="submit" class="mt-4" />
      </AppForm>
    </Card>
  </section>
</template>
