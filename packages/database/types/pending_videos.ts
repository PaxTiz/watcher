import type { SubscriptionType } from "@watcher/common";

import type { DatabaseSchemaInsert, RepositoryContext } from "../src/database";

export type FindKnownInput = { service: SubscriptionType; service_ids: Array<string> };
export type FindKnownOutput = Array<string>;

export type AddManyData = Pick<
  DatabaseSchemaInsert["pending_videos"],
  "service" | "service_id" | "subscription_id" | "content_type"
>;
export type AddManyInput = { data: Array<AddManyData>; options?: RepositoryContext };
export type AddManyOutput = void;
