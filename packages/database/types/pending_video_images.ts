import type { DatabaseSchema, RepositoryContext } from "../src/database";

export type AddManyInput = { video_ids: Array<string>; options?: RepositoryContext };
export type AddManyOutput = void;

export type ClaimInput = { limit: number; lease_seconds: number };
export type ClaimOutput = Array<
  Pick<
    DatabaseSchema["videos"],
    "id" | "service" | "service_id" | "subscription_id" | "thumbnail_small" | "ready_at"
  > &
    Pick<DatabaseSchema["pending_video_images"], "attempts">
>;

export type RemoveInput = { video_id: string; options?: RepositoryContext };
export type RemoveOutput = void;

export type RecordFailureInput = { video_id: string; next_attempt_at: string };
export type RecordFailureOutput = void;
