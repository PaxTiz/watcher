import type { SubscriptionDetailsResource } from "@watcher/common";

export const useSubscription = (slug: string) => {
  return useAppFetch<SubscriptionDetailsResource>(`/api/subscriptions/${slug}`, {
    key: `subscription.${slug}`,
  });
};
