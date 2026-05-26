import type { SubscriptionResource } from "#shared/resources/subscriptions";

export const useSubscription = (slug: string) => {
  return useAppFetch<SubscriptionResource>(`/api/subscriptions/${slug}`, {
    key: `subscription.${slug}`,
  });
};
