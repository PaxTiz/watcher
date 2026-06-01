<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

const modelValue = defineModel<VideoFilters>({ required: true });

const { hide = [] } = defineProps<{
  hide?: Array<VideoFilterType>;
  color?: "primary" | "secondary";
}>();

const { videos } = useFormatter();

const { data: subscriptions } = await useAppFetch<Array<SubscriptionResource>>(
  "/api/subscriptions",
  {
    key: "subscriptions",
  },
);

const onSelectFilter = (key: VideoFilterType, value: string) => {
  modelValue.value[key] = value as any;
};

const items = computed(() =>
  [
    {
      key: "service",
      label: "Service",
      children: [
        { label: videos.filters.service("youtube"), value: "youtube", icon: "lucide:youtube" },
        { label: videos.filters.service("twitch"), value: "twitch", icon: "lucide:twitch" },
      ],
    },
    {
      key: "duration",
      label: "Durée",
      children: [
        { label: videos.filters.duration("less_than_10_minutes"), value: "less_than_10_minutes" },
        { label: videos.filters.duration("between_10_30_minutes"), value: "between_10_30_minutes" },
        { label: videos.filters.duration("between_30_60_minutes"), value: "between_30_60_minutes" },
        { label: videos.filters.duration("greater_than_1_hour"), value: "greater_than_1_hour" },
      ],
    },
    {
      key: "date",
      label: "Date",
      children: [
        { label: videos.filters.date("today"), value: "today" },
        { label: videos.filters.date("weekly"), value: "weekly" },
        { label: videos.filters.date("monthly"), value: "monthly" },
        { label: videos.filters.date("yearly"), value: "yearly" },
        { label: videos.filters.date("older"), value: "older" },
      ],
    },
    {
      key: "subscription_id",
      label: "Chaîne",
      allowSearch: true,
      children: (subscriptions.value ?? []).map((sub) => ({
        label: sub.name,
        value: sub.id,
        icon: sub.channel.service === "youtube" ? "lucide:youtube" : "lucide:twitch",
      })),
    },
    {
      key: "is_favorite",
      label: "En favoris uniquement",
      children: [
        {
          label: "Oui",
          value: true as any,
        },
        {
          label: "Non",
          value: false as any,
        },
      ],
    },
  ].filter((item) => !hide.includes(item.key as VideoFilterType)),
);
</script>

<template>
  <DropdownButton
    label="Ajouter un filtre"
    :items="items"
    :color="color"
    @select="(k, v) => onSelectFilter(k as VideoFilterType, v)"
  />
</template>
