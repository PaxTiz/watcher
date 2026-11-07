import type { SubscriptionResource } from "@watcher/common";

const KEY = "subscriptions.all";

export const useSubscriptions = () => {
  const { data, error, refresh, status, clear } = useAppFetch<Array<SubscriptionResource>>(
    "/api/subscriptions",
    {
      key: KEY,
      getCachedData(k, nuxtApp, { cause }) {
        if (cause === "refresh:manual" || cause === "refresh:hook") {
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

// For components rendered many times, which only need to trigger a refresh
export const useRefreshSubscriptions = () => {
  const nuxtApp = useNuxtApp();

  return () => nuxtApp.runWithContext(() => refreshNuxtData(KEY));
};
