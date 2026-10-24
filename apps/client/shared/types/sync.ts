import type { VideoPalette } from "@watcher/common";
import type { DatabaseSchema, DatabaseSchemaInsert } from "@watcher/database";

export type Sync = {
  Subscription: {
    status: "created" | "updated" | "deleted";
    channel: Omit<DatabaseSchemaInsert["subscriptions"], "id">;
  };
  SubscriptionsList: Array<Sync["Subscription"]>;

  Video: {
    status: "created" | "updated" | "deleted";
    video: Omit<DatabaseSchema["videos"], "id" | "palette">;
  };
  VideoWithPalette: Omit<DatabaseSchema["videos"], "id" | "palette"> & {
    palette: VideoPalette | null;
  };
  VideosList: Array<Sync["Video"]>;
};
