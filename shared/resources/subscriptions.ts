import type { SubscriptionType } from "#shared/types/subscriptions";

export type SubscriptionResource = {
  id: number;

  name: string;

  channel: {
    service: SubscriptionType;
    url: string;
    logo: string;
  };
};
