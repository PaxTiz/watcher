import type { SubscriptionResource } from "#shared/resources/subscriptions";

export const useSubscriptions = () => {
  const { data, error, refresh, status, clear } = useAsyncData<Array<SubscriptionResource>>(
    "subscriptions.all",
    () => $fetch("/api/subscriptions"),
    {
      getCachedData(k) {
        const { data } = useNuxtData<Array<SubscriptionResource>>(k);
        return data.value;
      },
    },
  );

  const youtube = computed(() => data.value?.filter((e) => e.channel.service === "youtube") ?? []);
  const twitch = computed(() => data.value?.filter((e) => e.channel.service === "twitch") ?? []);

  return {
    data,
    error,
    refresh,
    status,
    clear,

    youtube,
    twitch,
  };
};
