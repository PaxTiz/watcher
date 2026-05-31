import type { SubscriptionResource } from "#shared/resources/subscriptions";

export const useSubscriptions = () => {
  const { data, error, refresh, status, clear } = useAppFetch<Array<SubscriptionResource>>(
    "/api/subscriptions",
    {
      key: "subscriptions.all",
      getCachedData(k, nuxtApp, { cause }) {
        if (cause === "refresh:manual") {
          return undefined;
        }

        const { data } = useNuxtData<Array<SubscriptionResource>>(k);
        return data.value;
      },
    },
  );

  const forceRefresh = async () => {
    return refresh({ cause: "refresh:manual" });
  };

  const youtube = computed(() => data.value?.filter((e) => e.channel.service === "youtube") ?? []);
  const twitch = computed(() => data.value?.filter((e) => e.channel.service === "twitch") ?? []);

  const favorites = computed(() => {
    return data.value?.filter((e) => e.is_favorite) ?? [];
  });

  const others = computed(() => {
    return data.value?.filter((e) => !e.is_favorite) ?? [];
  });

  return {
    data,
    error,
    refresh,
    forceRefresh,
    status,
    clear,

    youtube,
    twitch,
    favorites,
    others,
  };
};
