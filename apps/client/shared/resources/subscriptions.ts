import type { SubscriptionType } from "#shared/types/subscriptions";

export type SubscriptionResource = {
  id: string;

  name: string;

  slug: string;

  isFavorite: boolean;

  channel: {
    service: SubscriptionType;
    url: string;
    logo: string;
  };
};
