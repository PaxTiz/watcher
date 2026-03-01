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
      <div class="shadow-2xl flex flex-col gap-0.5 w-full min-w-[150px] bg-ui-border p-1 rounded">
        <VideosFiltersInner
          label="Service"
          :options="[
            { label: 'YouTube', value: 'youtube', icon: 'lucide:youtube' },
            { label: 'Twitch', value: 'twitch', icon: 'lucide:twitch' },
          ]"
        />

        <VideosFiltersInner
          label="Duréé"
          :options="[
            { label: '< 10 min', value: 'less_than_10_minutes' },
            { label: 'Entre 10 min et 30 min', value: 'between_10_30_minutes' },
            { label: 'Entre 30 min et 60 min', value: 'between_30_60_minutes' },
            { label: '> 1 heure', value: 'greater_than_1_hour' },
          ]"
        />

        <VideosFiltersInner
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
          class="flex items-center justify-between text-ui-text text-sm p-1 hover:bg-ui-bg rounded"
        >
          <span>Chaîne</span>
          <Icon name="lucide:chevron-right" />
        </div>

        <VideosFiltersInner
          label="Groupe"
          :options="[
            { label: 'Et', value: 'and' },
            { label: 'Ou', value: 'or' },
          ]"
        />
      </div>
    </template>
  </Tippy>
</template>
