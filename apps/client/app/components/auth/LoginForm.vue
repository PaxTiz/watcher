<script lang="ts" setup>
import type { FormSubmitEvent } from "@watcher/ui";

import { type OAuthValidators, oauthValidatorsSchema } from "#shared/validators/oauth";

const {
  title = "Connexion avec Bluesky",
  description = "Veuillez vous connecter avec votre compte Bluesky afin d'accéder à Watcher.",
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
    <h1 class="page-title">{{ title }}</h1>
    <p class="text-ui-text-muted mt-2">
      {{ description }}
    </p>

    <WatcherForm
      class="mt-6"
      method="POST"
      :state="state"
      :schema="oauthValidatorsSchema.loginWithBluesky.body"
      @submit="onSubmit"
    >
      <WatcherFormField label="Identifiant Bluesky" name="handle">
        <WatcherFormInput
          ref="input"
          v-model="state.handle"
          placeholder="vous.bsky.social"
          class="w-full"
        />
      </WatcherFormField>

      <WatcherButton :label="button" type="submit" color="solid" size="lg" class="mt-5 w-full" />
    </WatcherForm>
  </section>
</template>
