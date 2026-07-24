import type { SubscriptionResource } from "@watcher/common";

export const useSubscription = (slug: string) => {
  return useAppFetch<SubscriptionResource>(`/api/subscriptions/${slug}`, {
    key: `subscription.${slug}`,
  });
};
