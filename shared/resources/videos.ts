import type { SubscriptionResource } from "./subscriptions";
import type { SubscriptionType } from "#shared/types/subscriptions";

export type VideoResource = {
  id: number;

  service: SubscriptionType;

  author: SubscriptionResource;

  title: string;

  description: string;

  duration: number;

  url: string;

  thumbnail: string;

  created_at: string;
};
