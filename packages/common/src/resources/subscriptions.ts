import type { SubscriptionType } from "../types/subscriptions";

export type SubscriptionResource = {
  id: string;

  name: string;

  slug: string;

  is_favorite: boolean;

  is_hidden: boolean;

  last_video_at?: string | null;

  channel: {
    service: SubscriptionType;
    logo: string; // without extension: append `.avif` or `.webp`
  };
};

export type SubscriptionDetailsResource = SubscriptionResource & {
  channel: {
    url: string;
  };
};
