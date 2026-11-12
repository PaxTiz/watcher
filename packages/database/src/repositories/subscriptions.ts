import type {
  FindAllByUserInput,
  FindAllByUserOutput,
  FindAllForSyncInput,
  FindAllForSyncOutput,
  FindOneByUserInput,
  FindOneByUserOutput,
  UpsertInput,
  UpsertOutput,
} from "../../types/subscriptions";
import { resolveDatabase, useDatabase } from "../database";
import { whereSubscriptionIdentifier } from "../helpers";
import { select_subscriptions_with_user_state } from "../queries";

export async function find_all_by_user({
  user_id,
}: FindAllByUserInput): Promise<FindAllByUserOutput> {
  return select_subscriptions_with_user_state(user_id)
    .orderBy("user_subscriptions.is_hidden", "asc")
    .orderBy("subscriptions.name", "asc")
    .execute();
}

export async function find_one_by_user({
  user_id,
  identifier,
}: FindOneByUserInput): Promise<FindOneByUserOutput> {
  return select_subscriptions_with_user_state(user_id)
    .where(whereSubscriptionIdentifier(identifier))
    .executeTakeFirst();
}

export async function find_all_for_sync({
  user_id,
  service,
}: FindAllForSyncInput): Promise<FindAllForSyncOutput> {
  return useDatabase()
    .selectFrom("user_subscriptions")
    .innerJoin("subscriptions", "subscriptions.id", "user_subscriptions.subscription_id")
    .select(["service", "service_id", "name", "url", "logo", "logo_etag", "last_synced_at", "slug"])
    .where("user_subscriptions.user_id", "=", user_id)
    .where("subscriptions.service", "=", service)
    .execute();
}

export async function upsert({ data, options }: UpsertInput): Promise<UpsertOutput> {
  const database = resolveDatabase(options);

  return database
    .insertInto("subscriptions")
    .values(data)
    .onConflict((row) =>
      row.columns(["service", "service_id"]).doUpdateSet({
        logo: (c) => c.ref("excluded.logo"),
        logo_etag: (c) => c.ref("excluded.logo_etag"),
        url: (c) => c.ref("excluded.url"),
        name: (c) => c.ref("excluded.name"),
        last_synced_at: (c) => c.ref("excluded.last_synced_at"),
      }),
    )
    .returning("id")
    .executeTakeFirstOrThrow();
}
