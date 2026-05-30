<script lang="ts" setup>
import type { SubscriptionResource } from "#shared/resources/subscriptions";

const { filters } = useVideosFilters();

const { hide = [] } = defineProps<{
  hide?: Array<VideoFilterType>;
  color?: "primary" | "secondary" | "gradient";
}>();

const { data: subscriptions } = await useAppFetch<Array<SubscriptionResource>>(
  "/api/subscriptions",
  {
    key: "subscriptions",
  },
);

const onSelectFilter = (key: keyof (typeof filters)["value"], value: string) => {
  filters.value[key] = value as any;
};

const items = computed(() =>
  [
    {
      key: "service",
      label: "Service",
      children: [
        { label: "YouTube", value: "youtube", icon: "lucide:youtube" },
        { label: "Twitch", value: "twitch", icon: "lucide:twitch" },
      ],
    },
    {
      key: "duration",
      label: "Durée",
      children: [
        { label: "< 10 min", value: "less_than_10_minutes" },
        { label: "Entre 10 min et 30 min", value: "between_10_30_minutes" },
        { label: "Entre 30 min et 60 min", value: "between_30_60_minutes" },
        { label: "> 1 heure", value: "greater_than_1_hour" },
      ],
    },
    {
      key: "date",
      label: "Date",
      children: [
        { label: "Aujourd'hui", value: "today" },
        { label: "Cette semaine", value: "weekly" },
        { label: "Ce mois", value: "monthly" },
        { label: "Cette année", value: "yearly" },
        { label: "Plus ancien", value: "older" },
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
          value: true,
        },
        {
          label: "Non",
          value: false,
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
    @select="onSelectFilter"
  />
</template>
