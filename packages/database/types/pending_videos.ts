import type { SubscriptionType } from "@watcher/common";

import type { DatabaseSchema, DatabaseSchemaInsert, RepositoryContext } from "../src/database";

export type FindKnownInput = { service: SubscriptionType; service_ids: Array<string> };
export type FindKnownOutput = Array<string>;

export type AddManyData = Pick<
  DatabaseSchemaInsert["pending_videos"],
  "service" | "service_id" | "subscription_id" | "content_type"
>;
export type AddManyInput = { data: Array<AddManyData>; options?: RepositoryContext };
export type AddManyOutput = void;

export type ClaimInput = { service: SubscriptionType; limit: number; lease_seconds: number };
export type ClaimOutput = Array<
  Pick<DatabaseSchema["pending_videos"], "service_id" | "content_type" | "attempts"> & {
    channel_id: string;
    channel_name: string;
  }
>;

export type RemoveManyInput = {
  service: SubscriptionType;
  service_ids: Array<string>;
  options?: RepositoryContext;
};
export type RemoveManyOutput = void;

export type PostponeInput = {
  service: SubscriptionType;
  service_ids: Array<string>;
  next_attempt_at: string;
  failed: boolean;
};
export type PostponeOutput = void;

export type StatsInput = { service: SubscriptionType };
export type StatsOutput = { size: number; max_attempts: number; lag_seconds: number };
