import type { SubscriptionTable, VideoTable } from "#server/database/schema";

export type Sync = {
  Subscription: {
    status: "created" | "updated" | "deleted";
    channel: Omit<SubscriptionTable, "id">;
  };
  SubscriptionsList: Array<Sync["Subscription"]>;

  Video: {
    status: "created" | "updated" | "deleted";
    video: Omit<VideoTable, "id">;
  };
  VideosList: Array<Sync["Video"]>;
};
