<script lang="ts" setup>
import { Tippy } from "vue-tippy";
</script>

<template>
  <Tippy
    placement="bottom-start"
    trigger="click"
    :delay="0"
    :duration="0"
    :offset="[0, 4]"
    interactive
  >
    <Button label="Ajouter un filtre" />

    <template #content>
      <div class="bg-ui-border flex w-full min-w-[150px] flex-col gap-0.5 rounded p-1 shadow-2xl">
        <VideosFiltersInner
          type="service"
          label="Service"
          :options="[
            { label: 'YouTube', value: 'youtube', icon: 'lucide:youtube' },
            { label: 'Twitch', value: 'twitch', icon: 'lucide:twitch' },
          ]"
        />

        <VideosFiltersInner
          type="duration"
          label="Duréé"
          :options="[
            { label: '< 10 min', value: 'less_than_10_minutes' },
            { label: 'Entre 10 min et 30 min', value: 'between_10_30_minutes' },
            { label: 'Entre 30 min et 60 min', value: 'between_30_60_minutes' },
            { label: '> 1 heure', value: 'greater_than_1_hour' },
          ]"
        />

        <VideosFiltersInner
          type="date"
          label="Date"
          :options="[
            { label: 'Aujourd\'hui', value: 'today' },
            { label: 'Cette semaine', value: 'weekly' },
            { label: 'Ce mois', value: 'monthly' },
            { label: 'Cette année', value: 'yearly' },
            { label: 'Plus ancien', value: 'older' },
          ]"
        />

        <div
          class="text-ui-text hover:bg-ui-bg flex items-center justify-between rounded p-1 text-sm"
        >
          <span>Chaîne</span>
          <Icon name="lucide:chevron-right" />
        </div>
      </div>
    </template>
  </Tippy>
</template>
