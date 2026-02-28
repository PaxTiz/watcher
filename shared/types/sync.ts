import type { SubscriptionTable, VideoTable } from "#server/database/schema";

export type Sync = {
  Subscription: Omit<SubscriptionTable, "id">;
  SubscriptionsList: Array<Sync["Subscription"] & { local_logo: string }>;

  Video: Omit<VideoTable, "id">;
  VideosList: Array<Sync["Video"]>;
};

type SyncUpsert<T> = {
  upsert: T;
  removed: Array<string>;
};

export type SyncSubscriptionsUpsert = SyncUpsert<Sync["SubscriptionsList"]>;
export type SyncVideosUpsert = SyncUpsert<Sync["VideosList"]>;
