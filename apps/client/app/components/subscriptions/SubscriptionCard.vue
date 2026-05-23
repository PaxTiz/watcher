<script lang="ts" setup>
import { toast } from "vue-sonner";

import { NuxtLink } from "#components";
import type { SubscriptionResource } from "#shared/resources/subscriptions";

const { subscription, flat = false } = defineProps<{
  subscription: SubscriptionResource;
  flat?: boolean;
}>();

const card = useTemplateRef("card");
const { forceRefresh } = useSubscriptions();

const { execute } = usePost(
  `/api/subscriptions/${subscription.id}/favorite`,
  {
    method: "POST",
  },
  { immediate: false },
);

const { pressed } = useMousePressed({ target: card });
onLongPress(
  card,
  async () => {
    await execute();

    if (subscription.is_favorite) {
      toast.success(`${subscription.name} a été retiré de vos favoris`);
    } else {
      toast.success(`${subscription.name} a été ajouté à vos favoris`);
    }

    await forceRefresh();
  },
  {
    delay: 300,
    modifiers: {
      stop: true,
    },
  },
);
</script>

<template>
  <Card
    ref="card"
    class="focus:outline-alt block rounded border-2 transition-all duration-300"
    :tag="NuxtLink"
    :class="{
      'p-2': !flat,
      'scale-105': pressed,
      'bg-highlight/15 border-highlight': subscription.is_favorite,
      'bg-ui-bg border-ui-border': !subscription.is_favorite,
    }"
    :to="`/subscription/${subscription.slug}`"
    :size="flat ? 'flat' : 'sm'"
    target="_blank"
    external
    transparent
    @click.stop
  >
    <SubscriptionImage :subscription="subscription" />

    <p
      v-if="!flat"
      class="mt-2 flex items-center justify-center text-center text-xs"
      :class="{
        'text-white': subscription.is_favorite,
        'text-slate-400': !subscription.is_favorite,
      }"
    >
      <Icon
        class="shrink-0"
        :name="subscription.channel.service === 'youtube' ? 'lucide:youtube' : 'lucide:twitch'"
      />

      <span class="ml-1 truncate">{{ subscription.name }}</span>
    </p>
  </Card>
</template>
