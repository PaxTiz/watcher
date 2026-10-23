import type { SubscriptionType } from "@watcher/common";

import type { DatabaseSchema, DatabaseSchemaInsert, RepositoryContext } from "../src/database";

export type SubscriptionIdentifier = { id: string } | { slug: string };

export type SubscriptionWithUserState = Pick<
  DatabaseSchema["subscriptions"],
  "id" | "name" | "slug" | "service" | "url" | "logo" | "last_synced_at"
> &
  Pick<DatabaseSchema["user_subscriptions"], "is_favorite" | "is_hidden"> & {
    last_video_at: string | null;
  };

export type FindAllByUserInput = { user_id: string };
export type FindAllByUserOutput = Array<SubscriptionWithUserState>;

export type FindOneByUserInput = { user_id: string; identifier: SubscriptionIdentifier };
export type FindOneByUserOutput = SubscriptionWithUserState | undefined;

export type FindAllForSyncInput = { user_id: string; service: SubscriptionType };
export type FindAllForSyncOutput = Array<Omit<DatabaseSchema["subscriptions"], "id">>;

export type UpsertData = Omit<DatabaseSchemaInsert["subscriptions"], "id">;
export type UpsertInput = { data: UpsertData; options?: RepositoryContext };
export type UpsertOutput = { id: string };
