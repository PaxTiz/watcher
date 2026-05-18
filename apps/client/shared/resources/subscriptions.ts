import type { SubscriptionType } from "#shared/types/subscriptions";

export type SubscriptionResource = {
  id: string;

  name: string;

  slug: string;

  is_favorite: boolean;

  channel: {
    service: SubscriptionType;
    url: string;
    logo: string;
  };
};
