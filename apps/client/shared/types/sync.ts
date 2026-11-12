import type { DatabaseSchema, DatabaseSchemaInsert } from "@watcher/database";

export type Sync = {
  Subscription: {
    status: "created" | "updated" | "deleted";
    channel: Omit<DatabaseSchemaInsert["subscriptions"], "id"> & {
      logo_local: string;
    };
  };
  SubscriptionsList: Array<Sync["Subscription"]>;

  Video: {
    status: "created" | "updated" | "deleted";
    video: Omit<DatabaseSchema["videos"], "id"> & {
      thumbnail_small_local: string;
    };
  };

  VideosList: Array<Sync["Video"]>;
};
