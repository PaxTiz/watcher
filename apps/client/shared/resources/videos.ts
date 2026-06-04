import type { SubscriptionType } from "#shared/types/subscriptions";

import type { SubscriptionResource } from "./subscriptions";

export type VideoResource = {
  id: string;

  service: SubscriptionType;

  author: SubscriptionResource;

  title: string;

  description: string;

  duration: number;

  viewing_progression: number; // percentage of view between 0 and 1

  url: string;

  thumbnail: string;

  created_at: string;
};
