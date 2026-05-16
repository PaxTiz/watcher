import type { SubscriptionTableInsert, VideoTable } from "#server/database/schema";

export type Sync = {
  Subscription: {
    status: "created" | "updated" | "deleted";
    channel: Omit<SubscriptionTableInsert, "id">;
  };
  SubscriptionsList: Array<Sync["Subscription"]>;

  Video: {
    status: "created" | "updated" | "deleted";
    video: Omit<VideoTable, "id">;
  };
  VideosList: Array<Sync["Video"]>;
};
