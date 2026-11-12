import type { SubscriptionResource } from "./subscriptions";
import type { VideoListResource } from "./videos";

export type GuestResource = {
  key: string; // identifies the person, whatever the way it's written

  name: string; // as most often written in titles

  logo: string | null; // when the guest is a channel followed by the user

  videos_count: number;
};

export type SearchResource = {
  channels: Array<SubscriptionResource>;

  videos: Array<VideoListResource>;

  // Guests of the matching videos, to narrow them down
  guests: Array<GuestResource>;
};
