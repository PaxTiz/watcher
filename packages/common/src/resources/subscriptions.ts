import type { SubscriptionType } from "../types/subscriptions";

export type SubscriptionResource = {
  id: string;

  name: string;

  slug: string;

  is_favorite: boolean;

  is_hidden: boolean;

  last_synced_at: string;

  // Not set when the subscription is embedded in another resource (e.g. a video author)
  last_video_at?: string | null;

  channel: {
    service: SubscriptionType;
    url: string;
    logo: string;
  };
};
