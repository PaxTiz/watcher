import type { DatabaseSchema } from "@watcher/database";

export type Sync = {
  Video: {
    status: "created" | "updated" | "deleted";
    video: Omit<DatabaseSchema["videos"], "id" | "search" | "content_type" | "checked_at"> & {
      thumbnail_small_local: string;
    };
  };
};
