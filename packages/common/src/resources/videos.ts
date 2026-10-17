import type { SubscriptionType } from "../types/subscriptions";
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

  // Dominant colour of the thumbnail, as "#rrggbb", null until computed
  color: string | null;

  created_at: string;
};
